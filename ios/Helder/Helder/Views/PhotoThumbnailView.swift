import SwiftUI

struct PhotoThumbnailView: View {
    let assetIdentifier: String
    var highQuality: Bool = false

    @State private var image: UIImage?

    var body: some View {
        GeometryReader { proxy in
            Group {
                if let image {
                    Image(uiImage: image)
                        .resizable()
                } else {
                    Rectangle()
                        .fill(Color(.secondarySystemBackground))
                }
            }
            .task(id: assetIdentifier) {
                let scale = UIScreen.main.scale
                let side = max(proxy.size.width, proxy.size.height) * scale
                let target = side > 0
                    ? CGSize(width: side, height: side)
                    : CGSize(width: highQuality ? 900 : 240, height: highQuality ? 900 : 240)
                image = await ImageLoader.shared.image(for: assetIdentifier, targetSize: target)
            }
        }
    }
}
