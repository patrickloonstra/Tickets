import SwiftUI
import SwiftData

struct AlbumsView: View {
    @Query(sort: \Album.createdAt, order: .reverse) private var albums: [Album]
    @Query private var allPhotos: [Photo]
    @Environment(\.modelContext) private var modelContext
    @State private var isCreating = false
    @State private var newAlbumName = ""

    var body: some View {
        NavigationStack {
            Group {
                if albums.isEmpty {
                    ContentUnavailableView("Nog geen albums", systemImage: "rectangle.stack")
                } else {
                    ScrollView {
                        LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 12)], spacing: 12) {
                            ForEach(albums) { album in
                                NavigationLink {
                                    AlbumDetailView(album: album, photos: photos(in: album))
                                } label: {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(album.name)
                                            .font(.subheadline.weight(.medium))
                                            .foregroundStyle(.primary)
                                        Text("\(photos(in: album).count) foto's")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding()
                                    .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 14))
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Albums")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("+ Nieuw") { isCreating = true }
                }
            }
            .alert("Nieuw album", isPresented: $isCreating) {
                TextField("Naam", text: $newAlbumName)
                Button("Annuleer", role: .cancel) { newAlbumName = "" }
                Button("Maak") {
                    let trimmed = newAlbumName.trimmingCharacters(in: .whitespaces)
                    if !trimmed.isEmpty {
                        let album = Album(name: trimmed)
                        modelContext.insert(album)
                        try? modelContext.save()
                    }
                    newAlbumName = ""
                }
            }
        }
    }

    private func photos(in album: Album) -> [Photo] {
        allPhotos.filter { $0.albumIDs.contains(album.id) }
    }
}

private struct AlbumDetailView: View {
    let album: Album
    let photos: [Photo]
    @State private var selectedPhoto: Photo?

    var body: some View {
        ScrollView {
            if photos.isEmpty {
                ContentUnavailableView("Leeg", systemImage: "photo")
                    .padding(.top, 60)
            } else {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 100), spacing: 6)], spacing: 6) {
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
                .padding()
            }
        }
        .navigationTitle(album.name)
        .navigationBarTitleDisplayMode(.inline)
        .sheet(item: $selectedPhoto) { photo in
            PhotoViewerView(photo: photo)
        }
    }
}
