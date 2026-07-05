import SwiftUI

struct ContentView: View {
    @State private var showSettings = false

    var body: some View {
        ZStack(alignment: .topTrailing) {
            TabView {
                LibraryView()
                    .tabItem { Label("Bibliotheek", systemImage: "square.grid.2x2") }

                NavigationStack {
                    SortView()
                }
                .tabItem { Label("Sorteren", systemImage: "arrow.left.arrow.right") }

                SuggestionsView()
                    .tabItem { Label("Opschonen", systemImage: "scissors") }

                MemoriesView()
                    .tabItem { Label("Herinneringen", systemImage: "sparkles") }

                AlbumsView()
                    .tabItem { Label("Albums", systemImage: "rectangle.stack") }
            }

            Button {
                showSettings = true
            } label: {
                Image(systemName: "gearshape.fill")
                    .padding(10)
                    .background(.ultraThinMaterial, in: Circle())
            }
            .padding(.top, 4)
            .padding(.trailing, 12)
        }
        .sheet(isPresented: $showSettings) {
            SettingsView()
        }
    }
}

#Preview {
    ContentView()
        .modelContainer(for: [Photo.self, Album.self], inMemory: true)
}
