import SwiftUI
import SwiftData

private struct PhotoGroup: Identifiable {
    let id: String
    let title: String
    let subtitle: String
    let photos: [Photo]
}

struct LibraryView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Photo.takenAt, order: .reverse) private var allPhotos: [Photo]
    @StateObject private var libraryService = PhotoLibraryService()
    @State private var mode: GroupingMode = .events

    private enum GroupingMode: String, CaseIterable {
        case events = "Gebeurtenissen"
        case month = "Maand"
    }

    private var visiblePhotos: [Photo] {
        allPhotos.filter { $0.status != .archived }
    }

    private var groups: [PhotoGroup] {
        mode == .events ? groupByEvent(visiblePhotos) : groupByMonth(visiblePhotos)
    }

    var body: some View {
        NavigationStack {
            Group {
                if libraryService.authorizationStatus == .notDetermined {
                    accessRequestView
                } else if visiblePhotos.isEmpty {
                    ContentUnavailableView("Geen foto's gevonden", systemImage: "photo.on.rectangle")
                } else {
                    libraryGrid
                }
            }
            .navigationTitle("Bibliotheek")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(libraryService.authorizationStatus == .notDetermined ? "Toegang" : "Vernieuwen") {
                        Task {
                            await libraryService.requestAccess()
                            await libraryService.importNewPhotos(context: modelContext)
                        }
                    }
                }
            }
            .task {
                libraryService.refreshStatus()
                if libraryService.authorizationStatus == .authorized || libraryService.authorizationStatus == .limited {
                    await libraryService.importNewPhotos(context: modelContext)
                }
            }
        }
    }

    private var accessRequestView: some View {
        ContentUnavailableView {
            Label("Nog geen toegang tot foto's", systemImage: "sparkles")
        } description: {
            Text("Helder werkt volledig offline en slaat niets in de cloud op. Geef toegang en we organiseren je bibliotheek automatisch per maand en gebeurtenis.")
        } actions: {
            Button("Geef toegang tot je foto's") {
                Task {
                    await libraryService.requestAccess()
                    await libraryService.importNewPhotos(context: modelContext)
                }
            }
            .buttonStyle(.borderedProminent)
        }
    }

    private var libraryGrid: some View {
        ScrollView {
            Picker("Groeperen", selection: $mode) {
                ForEach(GroupingMode.allCases, id: \.self) { option in
                    Text(option.rawValue).tag(option)
                }
            }
            .pickerStyle(.segmented)
            .padding(.horizontal)
            .padding(.top, 8)

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 12)], spacing: 12) {
                ForEach(groups) { group in
                    NavigationLink {
                        GroupDetailView(title: group.title, subtitle: group.subtitle, photos: group.photos)
                    } label: {
                        GroupCard(group: group)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding()

            if libraryService.isImporting, let progress = libraryService.importProgress {
                Text("Bezig… \(progress.done)/\(progress.total)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .padding(.bottom)
            }
        }
    }

    private func groupByMonth(_ photos: [Photo]) -> [PhotoGroup] {
        let calendar = Calendar.current
        let grouped = Dictionary(grouping: photos) { photo in
            calendar.dateComponents([.year, .month], from: photo.takenAt)
        }
        let formatter = DateFormatter()
        formatter.dateFormat = "LLLL yyyy"
        formatter.locale = Locale(identifier: "nl_NL")

        let result: [PhotoGroup] = grouped.compactMap { components, list in
            guard let date = calendar.date(from: components) else { return nil }
            let key = "\(components.year ?? 0)-\(components.month ?? 0)"
            let sorted = list.sorted { $0.takenAt > $1.takenAt }
            return PhotoGroup(id: key, title: formatter.string(from: date), subtitle: "\(list.count) foto's", photos: sorted)
        }
        return result.sorted { ($0.photos.first?.takenAt ?? .distantPast) > ($1.photos.first?.takenAt ?? .distantPast) }
    }

    private func groupByEvent(_ photos: [Photo]) -> [PhotoGroup] {
        let inputs = photos.map {
            EventInput(id: $0.assetIdentifier, takenAt: $0.takenAt, latitude: $0.latitude, longitude: $0.longitude)
        }
        let events = EventClustering.cluster(inputs)
        let byID = Dictionary(uniqueKeysWithValues: photos.map { ($0.assetIdentifier, $0) })

        return events.map { event in
            let groupPhotos = event.photoIDs.compactMap { byID[$0] }
            return PhotoGroup(
                id: "\(event.startAt.timeIntervalSince1970)-\(event.photoIDs.first ?? "")",
                title: formatRange(event.startAt, event.endAt),
                subtitle: "\(groupPhotos.count) foto's",
                photos: groupPhotos
            )
        }
    }

    private func formatRange(_ start: Date, _ end: Date) -> String {
        let calendar = Calendar.current
        let fullFormatter = DateFormatter()
        fullFormatter.locale = Locale(identifier: "nl_NL")
        fullFormatter.dateFormat = "d MMMM yyyy"

        if calendar.isDate(start, inSameDayAs: end) {
            return fullFormatter.string(from: start)
        }

        let startComponents = calendar.dateComponents([.year, .month], from: start)
        let endComponents = calendar.dateComponents([.year, .month], from: end)

        if startComponents.year == endComponents.year && startComponents.month == endComponents.month {
            let dayFormatter = DateFormatter()
            dayFormatter.locale = Locale(identifier: "nl_NL")
            dayFormatter.dateFormat = "d"
            return "\(dayFormatter.string(from: start))–\(fullFormatter.string(from: end))"
        }

        let monthFormatter = DateFormatter()
        monthFormatter.locale = Locale(identifier: "nl_NL")
        monthFormatter.dateFormat = "d MMMM"
        return "\(monthFormatter.string(from: start)) – \(fullFormatter.string(from: end))"
    }
}

private struct GroupCard: View {
    let group: PhotoGroup

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            ZStack(alignment: .topTrailing) {
                if let cover = group.photos.first {
                    PhotoThumbnailView(assetIdentifier: cover.assetIdentifier)
                }
                let newCount = group.photos.filter { $0.status == .inbox }.count
                if newCount > 0 {
                    Text("\(newCount) nieuw")
                        .font(.caption2.bold())
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Color.orange, in: Capsule())
                        .foregroundStyle(.black)
                        .padding(6)
                }
            }
            .frame(height: 110)
            .background(Color(.secondarySystemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 14))

            Text(group.title)
                .font(.subheadline.weight(.medium))
                .lineLimit(1)
                .foregroundStyle(.primary)
            Text(group.subtitle)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
    }
}
