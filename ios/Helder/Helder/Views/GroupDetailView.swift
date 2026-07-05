import SwiftUI
import SwiftData

struct GroupDetailView: View {
    let title: String
    let subtitle: String
    let photos: [Photo]

    @Environment(\.modelContext) private var modelContext
    @State private var isSorting = false
    @State private var selectedPhoto: Photo?

    private var inboxPhotos: [Photo] {
        photos.filter { $0.status == .inbox }
    }

    var body: some View {
        ScrollView {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 100), spacing: 6)], spacing: 6) {
                ForEach(photos, id: \.assetIdentifier) { photo in
                    ZStack(alignment: .bottom) {
                        Button {
                            selectedPhoto = photo
                        } label: {
                            PhotoThumbnailView(assetIdentifier: photo.assetIdentifier)
                                .aspectRatio(1, contentMode: .fill)
                                .clipped()
                        }
                        if photo.status != .archived {
                            Button("Weggooien") {
                                photo.status = .archived
                                try? modelContext.save()
                            }
                            .font(.caption2)
                            .foregroundStyle(.red)
                            .padding(.vertical, 4)
                            .frame(maxWidth: .infinity)
                            .background(.black.opacity(0.6))
                        }
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                }
            }
            .padding()
        }
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                if !inboxPhotos.isEmpty {
                    Button("Sorteren (\(inboxPhotos.count))") {
                        isSorting = true
                    }
                }
            }
        }
        .navigationDestination(isPresented: $isSorting) {
            SortView(photoIDs: inboxPhotos.map(\.assetIdentifier), title: title)
        }
        .sheet(item: $selectedPhoto) { photo in
            PhotoViewerView(photo: photo)
        }
    }
}
