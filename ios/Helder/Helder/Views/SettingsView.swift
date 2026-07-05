import SwiftUI
import SwiftData

struct SettingsView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @Query private var allPhotos: [Photo]
    @State private var confirmEmpty = false
    @StateObject private var libraryService = PhotoLibraryService()

    private var archived: [Photo] {
        allPhotos.filter { $0.status == .archived }
    }

    var body: some View {
        NavigationStack {
            List {
                Section("Overzicht") {
                    LabeledContent("Foto's", value: "\(allPhotos.count)")
                    LabeledContent("In archief", value: "\(archived.count)")
                }

                Section("Onze belofte") {
                    Text("Geen account nodig, geen server: al je foto's blijven gewoon in je eigen Foto's-bibliotheek.")
                    Text("Wij slaan alleen lichte metadata lokaal op dit toestel op (datum, GPS, een fingerprint) — nooit de foto's zelf, en nooit ergens anders.")
                    Text("Geen cookies, geen analytics, geen trackers van wie dan ook.")
                }

                Section("Archief") {
                    if archived.isEmpty {
                        Text("Archief is leeg").foregroundStyle(.secondary)
                    } else {
                        ForEach(archived, id: \.assetIdentifier) { photo in
                            HStack {
                                PhotoThumbnailView(assetIdentifier: photo.assetIdentifier)
                                    .frame(width: 44, height: 44)
                                    .clipShape(RoundedRectangle(cornerRadius: 8))
                                Text(photo.takenAt.formatted(date: .abbreviated, time: .omitted))
                                    .font(.caption)
                                Spacer()
                                Button("Terugzetten") {
                                    photo.status = .kept
                                    try? modelContext.save()
                                }
                                .font(.caption)
                            }
                        }
                        Button("Archief definitief leegmaken", role: .destructive) {
                            confirmEmpty = true
                        }
                    }
                }
            }
            .navigationTitle("Instellingen & privacy")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Sluiten") { dismiss() }
                }
            }
            .confirmationDialog(
                "\(archived.count) foto's definitief verwijderen uit je Foto's-bibliotheek?",
                isPresented: $confirmEmpty,
                titleVisibility: .visible
            ) {
                Button("Verwijder definitief", role: .destructive) {
                    let toDelete = archived
                    Task {
                        await libraryService.permanentlyDelete(toDelete.map(\.assetIdentifier))
                        for photo in toDelete {
                            modelContext.delete(photo)
                        }
                        try? modelContext.save()
                    }
                }
                Button("Annuleer", role: .cancel) {}
            }
        }
    }
}
