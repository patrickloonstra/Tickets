import SwiftUI
import SwiftData

struct SuggestionsView: View {
    @Query private var allPhotos: [Photo]
    @Environment(\.modelContext) private var modelContext
    @State private var selectedPhoto: Photo?

    private var candidates: [Photo] {
        allPhotos.filter { $0.status != .archived }
    }

    private var duplicateGroups: [[Photo]] {
        var groups: [[Photo]] = []
        var assigned = Set<String>()
        let list = candidates
        for i in list.indices {
            if assigned.contains(list[i].assetIdentifier) { continue }
            var group = [list[i]]
            assigned.insert(list[i].assetIdentifier)
            for j in (i + 1)..<list.count {
                if assigned.contains(list[j].assetIdentifier) { continue }
                if ImageAnalysis.hammingDistance(list[i].phash, list[j].phash) <= ImageAnalysis.duplicateThreshold {
                    group.append(list[j])
                    assigned.insert(list[j].assetIdentifier)
                }
            }
            if group.count > 1 { groups.append(group) }
        }
        return groups
    }

    private var blurCandidates: [Photo] {
        let grouped = Set(duplicateGroups.flatMap { $0.map(\.assetIdentifier) })
        return candidates.filter { !grouped.contains($0.assetIdentifier) && $0.sharpness < ImageAnalysis.blurThreshold }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                if duplicateGroups.isEmpty && blurCandidates.isEmpty {
                    ContentUnavailableView("Lekker opgeruimd", systemImage: "checkmark.seal")
                        .padding(.top, 60)
                } else {
                    VStack(alignment: .leading, spacing: 20) {
                        ForEach(Array(duplicateGroups.enumerated()), id: \.offset) { _, group in
                            SuggestionCard(title: "\(group.count) foto's lijken op elkaar") {
                                LazyVGrid(columns: [GridItem(.adaptive(minimum: 80), spacing: 6)], spacing: 6) {
                                    ForEach(group, id: \.assetIdentifier) { photo in
                                        thumbnailWithDiscard(photo)
                                    }
                                }
                            }
                        }
                        ForEach(blurCandidates, id: \.assetIdentifier) { photo in
                            SuggestionCard(title: "Deze lijkt wazig") {
                                HStack(alignment: .top) {
                                    thumbnailWithDiscard(photo)
                                        .frame(width: 80)
                                    Text("Bekijk 'm rustig en beslis zelf")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                    }
                    .padding()
                }
            }
            .navigationTitle("Opschonen")
            .sheet(item: $selectedPhoto) { photo in
                PhotoViewerView(photo: photo)
            }
        }
    }

    @ViewBuilder
    private func thumbnailWithDiscard(_ photo: Photo) -> some View {
        VStack(spacing: 4) {
            Button {
                selectedPhoto = photo
            } label: {
                PhotoThumbnailView(assetIdentifier: photo.assetIdentifier)
                    .aspectRatio(1, contentMode: .fill)
                    .clipped()
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            }
            Button("Archiveer") {
                photo.status = .archived
                try? modelContext.save()
            }
            .font(.caption2)
            .foregroundStyle(.red)
        }
    }
}

private struct SuggestionCard<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title).font(.subheadline)
            content
        }
        .padding()
        .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 16))
    }
}
