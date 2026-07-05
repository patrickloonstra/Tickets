import SwiftUI

struct SwipeCardView: View {
    let photo: Photo
    let isTop: Bool
    let onDecide: (PhotoStatus) -> Void

    @State private var offset: CGSize = .zero

    private let threshold: CGFloat = 120

    var body: some View {
        PhotoThumbnailView(assetIdentifier: photo.assetIdentifier, highQuality: true)
            .clipShape(RoundedRectangle(cornerRadius: 24))
            .overlay(alignment: .topLeading) {
                Text("BEWAREN")
                    .font(.caption.bold())
                    .padding(6)
                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(.green, lineWidth: 2))
                    .foregroundStyle(.green)
                    .padding(16)
                    .rotationEffect(.degrees(-8))
                    .opacity(isTop ? Double(max(0, min(1, offset.width / threshold))) : 0)
            }
            .overlay(alignment: .topTrailing) {
                Text("WEG")
                    .font(.caption.bold())
                    .padding(6)
                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(.red, lineWidth: 2))
                    .foregroundStyle(.red)
                    .padding(16)
                    .rotationEffect(.degrees(8))
                    .opacity(isTop ? Double(max(0, min(1, -offset.width / threshold))) : 0)
            }
            .shadow(radius: 12)
            .offset(isTop ? offset : .zero)
            .rotationEffect(.degrees(isTop ? Double(offset.width / 20) : 0))
            .animation(.spring(response: 0.35, dampingFraction: 0.85), value: offset)
            .gesture(
                DragGesture()
                    .onChanged { value in
                        guard isTop else { return }
                        offset = value.translation
                    }
                    .onEnded { value in
                        guard isTop else { return }
                        if value.translation.width > threshold {
                            onDecide(.kept)
                        } else if value.translation.width < -threshold {
                            onDecide(.archived)
                        }
                        offset = .zero
                    }
            )
    }
}
