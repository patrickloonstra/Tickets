import SwiftUI
import SwiftData

struct MemoriesView: View {
    @Query private var allPhotos: [Photo]
    @State private var selectedPhoto: Photo?

    private var visible: [Photo] {
        allPhotos.filter { $0.status != .archived }
    }

    private var onThisDay: [Photo] {
        let calendar = Calendar.current
        let now = Date()
        return visible.filter { photo in
            let sameDay = calendar.component(.day, from: photo.takenAt) == calendar.component(.day, from: now)
            let sameMonth = calendar.component(.month, from: photo.takenAt) == calendar.component(.month, from: now)
            let differentYear = calendar.component(.year, from: photo.takenAt) != calendar.component(.year, from: now)
            return sameDay && sameMonth && differentYear
        }
    }

    private var forgottenGems: [Photo] {
        let now = Date()
        return Array(
            visible
                .filter { now.timeIntervalSince($0.lastViewedAt) > 30 * 24 * 60 * 60 }
                .sorted { $0.lastViewedAt < $1.lastViewedAt }
                .prefix(12)
        )
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    if visible.isEmpty {
                        ContentUnavailableView("Nog geen herinneringen", systemImage: "sparkles")
                            .padding(.top, 60)
                    } else if onThisDay.isEmpty && forgottenGems.isEmpty {
                        ContentUnavailableView("Nog even geduld", systemImage: "sparkles")
                            .padding(.top, 60)
                    } else {
                        if !onThisDay.isEmpty {
                            section(title: "Op deze dag", photos: onThisDay)
                        }
                        if !forgottenGems.isEmpty {
                            section(title: "Bijna vergeten", photos: forgottenGems)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Herinneringen")
            .sheet(item: $selectedPhoto) { photo in
                PhotoViewerView(photo: photo)
            }
        }
    }

    @ViewBuilder
    private func section(title: String, photos: [Photo]) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title).font(.headline)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 90), spacing: 6)], spacing: 6) {
                ForEach(photos, id: \.assetIdentifier) { photo in
                    Button {
                        selectedPhoto = photo
                    } label: {
                        PhotoThumbnailView(assetIdentifier: photo.assetIdentifier)
                            .aspectRatio(1, contentMode: .fill)
                            .clipped()
                            .clipShape(RoundedRectangle(cornerRadius: 10))
                    }
                }
            }
        }
    }
}
