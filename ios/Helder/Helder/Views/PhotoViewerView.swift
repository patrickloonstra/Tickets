import SwiftUI
import SwiftData

struct PhotoViewerView: View {
    @Bindable var photo: Photo

    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Album.createdAt, order: .reverse) private var albums: [Album]
    @State private var isCreatingAlbum = false
    @State private var newAlbumName = ""

    var body: some View {
        NavigationStack {
            PhotoThumbnailView(assetIdentifier: photo.assetIdentifier, highQuality: true)
                .aspectRatio(contentMode: .fit)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Sluiten") { dismiss() }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button {
                            photo.isFavorite.toggle()
                            try? modelContext.save()
                        } label: {
                            Image(systemName: photo.isFavorite ? "star.fill" : "star")
                        }
                    }
                    ToolbarItem(placement: .bottomBar) {
                        HStack {
                            Menu("Album") {
                                ForEach(albums) { album in
                                    Button {
                                        toggle(album)
                                    } label: {
                                        HStack {
                                            Text(album.name)
                                            if photo.albumIDs.contains(album.id) {
                                                Image(systemName: "checkmark")
                                            }
                                        }
                                    }
                                }
                                Button("Nieuw album…") { isCreatingAlbum = true }
                            }
                            Spacer()
                            if photo.status == .archived {
                                Button("Terugzetten") {
                                    photo.status = .kept
                                    try? modelContext.save()
                                }
                            } else {
                                Button("Archiveren", role: .destructive) {
                                    photo.status = .archived
                                    try? modelContext.save()
                                    dismiss()
                                }
                            }
                        }
                    }
                }
                .alert("Nieuw album", isPresented: $isCreatingAlbum) {
                    TextField("Naam", text: $newAlbumName)
                    Button("Annuleer", role: .cancel) { newAlbumName = "" }
                    Button("Maak") {
                        let trimmed = newAlbumName.trimmingCharacters(in: .whitespaces)
                        if !trimmed.isEmpty {
                            let album = Album(name: trimmed)
                            modelContext.insert(album)
                            photo.albumIDs.append(album.id)
                            try? modelContext.save()
                        }
                        newAlbumName = ""
                    }
                }
        }
        .onAppear {
            photo.lastViewedAt = .now
            try? modelContext.save()
        }
    }

    private func toggle(_ album: Album) {
        if let index = photo.albumIDs.firstIndex(of: album.id) {
            photo.albumIDs.remove(at: index)
        } else {
            photo.albumIDs.append(album.id)
        }
        try? modelContext.save()
    }
}
