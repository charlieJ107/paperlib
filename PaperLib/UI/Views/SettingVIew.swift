//
//  SettingView.swift
//  PaperLib (macOS)
//
//  Created by GeoffreyChen on 23/09/2021.
//

import SwiftUI

struct SettingsView: View {
    @Environment(\.injected) private var injected: DIContainer

    private enum Tabs: Hashable {
        case general
        case metadata
        case export
        case sync
    }

    var body: some View {
        TabView {
            GeneralSettingsView()
                .tabItem {
                    Label("General", systemImage: "gear")
                }
                .tag(Tabs.general)
            MatchSettingsView()
                .tabItem {
                    Label("Metadata", systemImage: "network")
                }
                .tag(Tabs.metadata)
            SyncSettingsView()
                .tabItem {
                    Label("Sync", systemImage: "icloud.and.arrow.up")
                }
                .tag(Tabs.sync)
            ExportSettingsView()
                .tabItem {
                    Label("Export", systemImage: "square.and.arrow.up")
                }
                .tag(Tabs.export)
        }
        .padding()
        .frame(width: 550, height: 300)
        .onAppear(perform: {
            injected.appState[\.setting.settingOpened] = true
        })
        .onDisappear(perform: {
            injected.appState[\.setting.settingOpened] = false
        })
    }
}

struct GeneralSettingsView: View {
    @Environment(\.injected) private var injected: DIContainer

    @AppStorage("appLibFolder") private var appLibFolder = ""
    @AppStorage("invertColor") private var invertColor = false
    @AppStorage("preferColorTheme") private var preferColorTheme = "System Default"
    @AppStorage("deleteSourceFile") private var deleteSourceFile = false

    @State var showPicker = false

    var body: some View {
        VStack(alignment: .leading) {
            HStack(alignment: .top) {
                Text("Choose a folder to store paper files (e.g., PDF etc.) and the database files. Note that this operation will create a new database in the selected folder instead of migrating the current one (or read the available database in the selected folder.). It is commenly used when you setup paperlib on a new device to access your previous data stored on a network shared folder.").frame(width: 250).multilineTextAlignment(.trailing).font(.caption)
                Text(
                    (appLibFolder.count > 7) ? String(appLibFolder[String.Index(utf16Offset: 7, in: appLibFolder)...]) : "Choose a folder"
                )
                .font(.caption)
                .frame(width: 250)
                .multilineTextAlignment(.leading)
                .padding(3)
                .overlay(
                    RoundedRectangle(cornerRadius: 3).stroke(Color.secondary, lineWidth: 1)
                ).onTapGesture {
                    onSelectFolder()
                }
            }
            .padding(.bottom, 15)

            HStack(alignment: .top) {
                Text("Color Theme.").frame(width: 250, alignment: .trailing).multilineTextAlignment(.trailing).font(.caption)
                Picker("", selection: $preferColorTheme) {
                    ForEach(["Light", "Dark", "System Default"], id: \.self) {
                        Text($0).font(.caption)
                    }
                }
                .pickerStyle(MenuPickerStyle())
                .frame(width: 150)
            }
            .padding(.bottom, 15)
            .onChange(of: preferColorTheme, perform: { colorTheme in
                injected.appState[\.setting.colorScheme] = colorTheme
            })

            HStack(alignment: .top) {
                Text("Invert colors of previews in the dark mode.").frame(width: 250, alignment: .trailing).multilineTextAlignment(.trailing).font(.caption)
                Toggle("", isOn: $invertColor)
                    .toggleStyle(.checkbox)
            }
            .onChange(of: invertColor, perform: { invert in
                injected.appState[\.setting.invertColor] = invert
            })
            
            HStack(alignment: .top) {
                Text("Automatically delete the imported source file.").frame(width: 250, alignment: .trailing).multilineTextAlignment(.trailing).font(.caption)
                Toggle("", isOn: $deleteSourceFile)
                    .toggleStyle(.checkbox)
            }
            .onChange(of: deleteSourceFile, perform: { deleteSourceFile in
                injected.appState[\.setting.deleteSourceFile] = deleteSourceFile
            })
        }
    }

    func onSelectFolder() {
        let folderChooserPoint = CGPoint(x: 0, y: 0)
        let folderChooserSize = CGSize(width: 500, height: 600)
        let folderChooserRectangle = CGRect(origin: folderChooserPoint, size: folderChooserSize)
        let folderPicker = NSOpenPanel(contentRect: folderChooserRectangle, styleMask: .utilityWindow, backing: .buffered, defer: true)

        folderPicker.canChooseDirectories = true
        folderPicker.canChooseFiles = false
        folderPicker.allowsMultipleSelection = false

        folderPicker.begin { response in

            if response == .OK {
                let pickedFolders = folderPicker.urls
                appLibFolder = pickedFolders[0].absoluteString

                injected.appState[\.receiveSignals.sideBar] += 1
                injected.appState[\.receiveSignals.mainView] += 1
                injected.appState[\.setting.appLibFolder] = pickedFolders[0].absoluteString

                injected.interactors.entitiesInteractor.openLib()
            }
        }
    }
}


struct MatchSettingsView: View {
    @Environment(\.injected) private var injected: DIContainer

    @AppStorage("ieeeAPIKey") private var ieeeAPIKey = ""
    @AppStorage("allowFetchPDFMeta") private var allowFetchPDFMeta = false
    @AppStorage("allowRoutineMatch") private var allowRoutineMatch = false
    @AppStorage("rematchInterval") private var rematchInterval = 7

    
    var body: some View {
        VStack(alignment: .leading) {
            
            HStack(alignment: .top) {
                Text("Scrape PDF's built-in metadata.").frame(width: 250, alignment: .trailing).multilineTextAlignment(.trailing).font(.caption)
                Toggle("", isOn: $allowFetchPDFMeta)
                    .toggleStyle(.checkbox)
            }
            .onChange(of: allowFetchPDFMeta, perform: { allowFetchPDFMeta in
                injected.appState[\.setting.allowFetchPDFMeta] = allowFetchPDFMeta
            })
            
            HStack(alignment: .top) {
                Text("IEEE Xplorer API Key, the request limitation with the IEEE API is up to 200 per day. The API Key can applied from IEEE Developer website. See more on Paperlib's Github.").frame(width: 250, alignment: .trailing).multilineTextAlignment(.trailing).font(.caption)
                TextField("", text: $ieeeAPIKey)
                    .toggleStyle(.checkbox)
            }
            .onChange(of: ieeeAPIKey, perform: { ieeeAPIKey in
                injected.appState[\.setting.ieeeAPIKey] = ieeeAPIKey
            })
            .padding(.bottom, 10)
            
            Divider()
            
            HStack(alignment: .top) {
                Text("Automatically re-match metadata for preprint papers.").frame(width: 250, alignment: .trailing).multilineTextAlignment(.trailing).font(.caption)
                Toggle("", isOn: $allowRoutineMatch)
                    .toggleStyle(.checkbox)
            }
            .onChange(of: allowRoutineMatch, perform: { allowRoutineMatch in
                injected.appState[\.setting.allowRoutineMatch] = allowRoutineMatch
            })
            .padding(.top, 10)
            HStack(alignment: .top) {
                Text("Rountine re-matching interval.").frame(width: 250, alignment: .trailing).multilineTextAlignment(.trailing).font(.caption)
                Picker("", selection: $rematchInterval) {
                    ForEach([1, 7, 30], id: \.self) {
                        Text("\($0) day(s)")
                    }
                }.pickerStyle(MenuPickerStyle()).padding(.leading, -8)
            }
            .onChange(of: rematchInterval, perform: { rematchInterval in
                injected.appState[\.setting.rematchInterval] = rematchInterval
                injected.interactors.entitiesInteractor.setRoutineTimer()
            })
        }
    }
}


struct SyncSettingsView: View {
    @Environment(\.injected) private var injected: DIContainer

    @AppStorage("syncAPIKey") private var syncAPIKey = ""
    @AppStorage("useSync") private var useSync = false

    var body: some View {
        VStack(alignment: .leading) {
            HStack(alignment: .top) {
                Text("Cloud Sync API Key is the your identification and authentication on the cloud database. Never share it with others. See more on Paperlib's Github.").frame(width: 250, alignment: .trailing).multilineTextAlignment(.trailing).font(.caption)
                TextField("", text: $syncAPIKey)
                    .disabled(useSync)
            }
            .onChange(of: syncAPIKey, perform: { syncAPIKey in
                injected.appState[\.setting.syncAPIKey] = syncAPIKey
            })
            .padding(.bottom, 10)
            
            HStack(alignment: .top) {
                Text("Use cloud sync. The PDF files are still stored in the folder you selected in the General setting page. The cloud database can only store the index and metadata of your data.").frame(width: 250, alignment: .trailing).multilineTextAlignment(.trailing).font(.caption)
                Toggle("", isOn: $useSync)
                    .toggleStyle(.checkbox)
            }
            .padding(.bottom, 10)
            .onChange(of: useSync, perform: onToggleUseSync)
            
            HStack(alignment: .top) {
                Text("Migrate the local database to the cloud sync database.").frame(width: 250, alignment: .trailing).multilineTextAlignment(.trailing).font(.caption)
                Button (action: {
                    print("migrate")
                    injected.interactors.entitiesInteractor.migrateLocaltoSync()
                }) {
                    Label("Migrate", systemImage: "icloud.and.arrow.up.fill")
                }
                .disabled(!useSync)
            }
            .padding(.bottom, 10)
        }
    }
    
    func onToggleUseSync (useSync: Bool) {
        injected.appState[\.setting.useSync] = useSync
        
        if !syncAPIKey.isEmpty {
            injected.appState[\.receiveSignals.sideBar] += 1
            injected.appState[\.receiveSignals.mainView] += 1
            
            injected.interactors.entitiesInteractor.openLib()
        }
    }
}


struct ExportSettingsView: View {
    @Environment(\.injected) private var injected: DIContainer

    @AppStorage("exportReplacement") private var exportReplacement: Data = .init()
    @AppStorage("enableExportReplacement") private var enableExportReplacement: Bool = false
    @State private var exportReplacementContainer: [String: String] = .init()
    @State private var newReplacementKey: String = ""
    @State private var newReplacementValue: String = ""
    
    var body: some View {
        VStack(alignment: .leading) {
            HStack{
                Text("Enable replacing publication title with customed string when exporting to bibtex. For example, replace 'Conference on Computer Vision and Pattern Recognition' by 'CVPR'.").font(.caption)
                Toggle("", isOn: $enableExportReplacement)
                    .toggleStyle(.checkbox)
                    .onChange(of: enableExportReplacement, perform: { enableExportReplacement in
                        injected.appState[\.setting.enableExportReplacement] = enableExportReplacement
                    })
            }
            HStack{
                TextField("original", text: $newReplacementKey).frame(width: 217, alignment: .trailing).multilineTextAlignment(.trailing).font(.caption)
                Image(systemName: "arrow.right")
                TextField("replacement", text: $newReplacementValue).frame(width: 217, alignment: .leading).multilineTextAlignment(.leading).font(.caption)
                Button(action: {
                    if (!newReplacementKey.isEmpty && !newReplacementValue.isEmpty) {
                        exportReplacementContainer[formatString(newReplacementKey, removeNewline: true)!] = formatString(newReplacementValue, removeNewline: true)!
                    }
                }){
                    Image(systemName: "plus.circle")
                }
                .buttonStyle(PlainButtonStyle())
            }
            List {
                ForEach(Array(exportReplacementContainer.keys), id: \.self) { key in
                    HStack{
                        Text(key).frame(width: 200, alignment: .trailing).multilineTextAlignment(.trailing).font(.caption)
                        Image(systemName: "arrow.right")
                        Text(exportReplacementContainer[key]!).frame(width: 200, alignment: .leading).multilineTextAlignment(.leading).font(.caption)
                        Button(action: {
                            exportReplacementContainer.removeValue(forKey: key)
                        }){
                            Image(systemName: "delete.left")
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
            }
        }
        .onAppear(perform: {
            guard let decodedExportReplacement = try? JSONDecoder().decode([String: String].self, from: exportReplacement) else { return }
            exportReplacementContainer = decodedExportReplacement
        })
        .onChange(of: exportReplacementContainer, perform: { _ in
            guard let encodedExportReplacement = try? JSONEncoder().encode(exportReplacementContainer) else { return }
            self.exportReplacement = encodedExportReplacement
            injected.appState[\.setting.exportReplacement] = self.exportReplacement
        })
    }
}