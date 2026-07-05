import UIKit
import CoreGraphics

/// On-device duplicate + blur detection. Ported from the web app's
/// `hash.ts` / `sharpness.ts`: a difference-hash (dHash) for near-duplicate
/// clustering, and variance-of-Laplacian for blur detection. No ML model,
/// no network — just pixel math.
enum ImageAnalysis {
    static let duplicateThreshold = 8
    static let blurThreshold = 60.0

    static func dHash(of image: UIImage) -> UInt64 {
        guard let gray = grayscalePixels(of: image, width: 9, height: 8) else { return 0 }
        var hash: UInt64 = 0
        for row in 0..<8 {
            for col in 0..<8 {
                let left = gray[row * 9 + col]
                let right = gray[row * 9 + col + 1]
                hash <<= 1
                if left > right { hash |= 1 }
            }
        }
        return hash
    }

    static func hammingDistance(_ a: UInt64, _ b: UInt64) -> Int {
        (a ^ b).nonzeroBitCount
    }

    static func sharpness(of image: UIImage) -> Double {
        let maxDimension = 200.0
        let largestSide = max(image.size.width, image.size.height)
        let scale = largestSide > 0 ? min(1, maxDimension / largestSide) : 1
        let width = max(3, Int(image.size.width * scale))
        let height = max(3, Int(image.size.height * scale))
        guard let gray = grayscalePixels(of: image, width: width, height: height) else { return 0 }
        return laplacianVariance(gray, width: width, height: height)
    }

    static func laplacianVariance(_ gray: [Double], width: Int, height: Int) -> Double {
        guard width >= 3, height >= 3 else { return 0 }
        var values: [Double] = []
        values.reserveCapacity((width - 2) * (height - 2))
        for y in 1..<(height - 1) {
            for x in 1..<(width - 1) {
                let center = gray[y * width + x]
                let up = gray[(y - 1) * width + x]
                let down = gray[(y + 1) * width + x]
                let left = gray[y * width + (x - 1)]
                let right = gray[y * width + (x + 1)]
                values.append(up + down + left + right - 4 * center)
            }
        }
        let mean = values.reduce(0, +) / Double(values.count)
        let variance = values.reduce(0) { $0 + ($1 - mean) * ($1 - mean) } / Double(values.count)
        return variance
    }

    static func thumbnail(of image: UIImage, maxDimension: CGFloat = 480) -> UIImage {
        let largestSide = max(image.size.width, image.size.height)
        let scale = largestSide > 0 ? min(1, maxDimension / largestSide) : 1
        let newSize = CGSize(width: image.size.width * scale, height: image.size.height * scale)
        let format = UIGraphicsImageRendererFormat.default()
        format.scale = 1
        let renderer = UIGraphicsImageRenderer(size: newSize, format: format)
        return renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: newSize))
        }
    }

    private static func grayscalePixels(of image: UIImage, width: Int, height: Int) -> [Double]? {
        guard let cgImage = image.cgImage else { return nil }
        var pixelData = [UInt8](repeating: 0, count: width * height * 4)
        let colorSpace = CGColorSpaceCreateDeviceRGB()
        guard let context = CGContext(
            data: &pixelData,
            width: width,
            height: height,
            bitsPerComponent: 8,
            bytesPerRow: width * 4,
            space: colorSpace,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        ) else { return nil }

        context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))

        var gray = [Double](repeating: 0, count: width * height)
        for i in 0..<(width * height) {
            let r = Double(pixelData[i * 4])
            let g = Double(pixelData[i * 4 + 1])
            let b = Double(pixelData[i * 4 + 2])
            gray[i] = 0.299 * r + 0.587 * g + 0.114 * b
        }
        return gray
    }
}
