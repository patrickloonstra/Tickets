import SwiftUI
import SwiftData

struct SortView: View {
    var photoIDs: [String]? = nil
    var title: String? = nil

    @Environment(\.modelContext) private var modelContext
    @Query(
        filter: #Predicate<Photo> { $0.statusRaw == "inbox" },
        sort: [SortDescriptor(\Photo.takenAt)]
    ) private var allInbox: [Photo]

    private var scopedInbox: [Photo] {
        guard let ids = photoIDs else { return allInbox }
        let idSet = Set(ids)
        return allInbox.filter { idSet.contains($0.assetIdentifier) }
    }

    private var queue: [Photo] {
        Array(scopedInbox.prefix(4))
    }

    var body: some View {
        VStack(spacing: 16) {
            if queue.isEmpty {
                ContentUnavailableView(
                    "Helemaal bijgewerkt",
                    systemImage: "checkmark.circle",
                    description: Text(photoIDs == nil
                        ? "Geen nieuwe foto's om te sorteren."
                        : "Niets meer te sorteren in dit groepje.")
                )
            } else {
                Text("\(scopedInbox.count) te gaan")
                    .font(.system(.subheadline, design: .monospaced))
                    .foregroundStyle(.secondary)

                ZStack {
                    ForEach(Array(queue.enumerated()).reversed(), id: \.element.assetIdentifier) { index, photo in
                        SwipeCardView(photo: photo, isTop: index == 0) { decision in
                            photo.status = decision
                            try? modelContext.save()
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .scaleEffect(1 - CGFloat(index) * 0.04)
                        .offset(y: CGFloat(index * 10))
                        .opacity(index > 2 ? 0 : 1)
                        .allowsHitTesting(index == 0)
                        .zIndex(Double(-index))
                    }
                }
                .aspectRatio(3 / 4, contentMode: .fit)
                .padding(.horizontal, 24)

                HStack(spacing: 32) {
                    Button {
                        decideTop(.archived)
                    } label: {
                        Image(systemName: "xmark")
                            .font(.title2)
                            .frame(width: 56, height: 56)
                            .background(Circle().stroke(.red, lineWidth: 1.5))
                            .foregroundStyle(.red)
                    }
                    Button {
                        decideTop(.kept)
                    } label: {
                        Image(systemName: "heart.fill")
                            .font(.title2)
                            .frame(width: 64, height: 64)
                            .background(Circle().fill(.orange))
                            .foregroundStyle(.white)
                    }
                }
                .padding(.bottom, 8)
            }
        }
        .navigationTitle(title ?? "Sorteren")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func decideTop(_ status: PhotoStatus) {
        guard let top = queue.first else { return }
        top.status = status
        try? modelContext.save()
    }
}
