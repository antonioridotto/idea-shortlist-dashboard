import SwiftUI

struct InjectionEntry: Identifiable, Codable, Equatable {
    let id: UUID
    var date: Date
    var doseMg: Double
    var note: String

    init(id: UUID = UUID(), date: Date, doseMg: Double, note: String = "") {
        self.id = id
        self.date = date
        self.doseMg = doseMg
        self.note = note
    }
}

@MainActor
final class GLP1TrackerViewModel: ObservableObject {
    @Published private(set) var entries: [InjectionEntry] = []
    @AppStorage("glp1.defaultDose") var defaultDose: Double = 0.25
    @AppStorage("glp1.reminderEnabled") var reminderEnabled: Bool = false
    @AppStorage("glp1.reminderHour") var reminderHour: Int = 20

    @Published var selectedDose: Double = 0.25
    @Published var selectedDate: Date = Date()
    @Published var note: String = ""

    private let storageKey = "glp1.entries.v1"

    init() {
        selectedDose = defaultDose
        load()
    }

    var lastInjection: InjectionEntry? {
        entries.sorted(by: { $0.date > $1.date }).first
    }

    var nextInjectionDate: Date? {
        guard let last = lastInjection else { return nil }
        return Calendar.current.date(byAdding: .day, value: 7, to: last.date)
    }

    var daysUntilNextShot: Int? {
        guard let next = nextInjectionDate else { return nil }
        let start = Calendar.current.startOfDay(for: Date())
        let end = Calendar.current.startOfDay(for: next)
        return Calendar.current.dateComponents([.day], from: start, to: end).day
    }

    var completedThisMonth: Int {
        let now = Date()
        return entries.filter { Calendar.current.isDate($0.date, equalTo: now, toGranularity: .month) }.count
    }

    var adherenceStreakWeeks: Int {
        let sorted = entries.sorted { $0.date > $1.date }
        guard sorted.count > 1 else { return sorted.isEmpty ? 0 : 1 }

        var streak = 1
        for index in 0..<(sorted.count - 1) {
            let newer = sorted[index].date
            let older = sorted[index + 1].date
            let days = Calendar.current.dateComponents([.day], from: older, to: newer).day ?? 0
            if (6...8).contains(days) {
                streak += 1
            } else {
                break
            }
        }
        return streak
    }

    func addInjection() {
        let trimmed = note.trimmingCharacters(in: .whitespacesAndNewlines)
        let entry = InjectionEntry(date: selectedDate, doseMg: selectedDose, note: trimmed)
        entries.append(entry)
        entries.sort { $0.date > $1.date }
        note = ""
        selectedDate = Date()
        defaultDose = selectedDose
        save()
    }

    func deleteEntries(at offsets: IndexSet) {
        entries.remove(atOffsets: offsets)
        save()
    }

    private func save() {
        guard let data = try? JSONEncoder().encode(entries) else { return }
        UserDefaults.standard.set(data, forKey: storageKey)
    }

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let decoded = try? JSONDecoder().decode([InjectionEntry].self, from: data) else { return }
        entries = decoded.sorted(by: { $0.date > $1.date })
    }
}

struct GLP1TrackerPrototypeView: View {
    @StateObject private var vm = GLP1TrackerViewModel()
    private let doses: [Double] = [0.25, 0.5, 1.0, 1.7, 2.4]

    var body: some View {
        TabView {
            HomeLogView(vm: vm, doses: doses)
                .tabItem { Label("Log", systemImage: "plus.circle") }

            HistoryView(vm: vm)
                .tabItem { Label("History", systemImage: "clock.arrow.circlepath") }

            StatsView(vm: vm)
                .tabItem { Label("Stats", systemImage: "chart.bar") }

            SettingsView(vm: vm)
                .tabItem { Label("Settings", systemImage: "gear") }
        }
    }
}

private struct HomeLogView: View {
    @ObservedObject var vm: GLP1TrackerViewModel
    let doses: [Double]

    var body: some View {
        NavigationStack {
            List {
                Section("Next Shot") {
                    if let nextDate = vm.nextInjectionDate {
                        HStack {
                            Label(nextDate.formatted(date: .abbreviated, time: .omitted), systemImage: "calendar")
                            Spacer()
                            Text(daysRemainingLabel)
                                .foregroundStyle(.secondary)
                        }
                    } else {
                        Text("No injections logged yet")
                            .foregroundStyle(.secondary)
                    }
                }

                Section("Log Injection") {
                    DatePicker("Date", selection: $vm.selectedDate, displayedComponents: .date)
                    Picker("Dose", selection: $vm.selectedDose) {
                        ForEach(doses, id: \.self) { dose in
                            Text("\(dose, specifier: "%.2g") mg").tag(dose)
                        }
                    }
                    TextField("Optional note", text: $vm.note)
                    Button("Add Injection") { vm.addInjection() }
                        .buttonStyle(.borderedProminent)
                }
            }
            .navigationTitle("GLP-1 Tracker")
        }
    }

    private var daysRemainingLabel: String {
        guard let days = vm.daysUntilNextShot else { return "" }
        switch days {
        case ..<0: return "Overdue"
        case 0: return "Today"
        case 1: return "1 day"
        default: return "\(days) days"
        }
    }
}

private struct HistoryView: View {
    @ObservedObject var vm: GLP1TrackerViewModel

    var body: some View {
        NavigationStack {
            List {
                if vm.entries.isEmpty {
                    Text("Your injection history will appear here")
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(vm.entries) { entry in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(entry.date.formatted(date: .abbreviated, time: .omitted))
                                    .font(.headline)
                                Spacer()
                                Text("\(entry.doseMg, specifier: "%.2g") mg")
                                    .foregroundStyle(.secondary)
                            }
                            if !entry.note.isEmpty {
                                Text(entry.note)
                                    .font(.footnote)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .padding(.vertical, 2)
                    }
                    .onDelete(perform: vm.deleteEntries)
                }
            }
            .navigationTitle("History")
        }
    }
}

private struct StatsView: View {
    @ObservedObject var vm: GLP1TrackerViewModel

    var body: some View {
        NavigationStack {
            List {
                Section("Adherence") {
                    LabeledContent("Current streak") {
                        Text("\(vm.adherenceStreakWeeks) week\(vm.adherenceStreakWeeks == 1 ? "" : "s")")
                    }
                    LabeledContent("Shots this month") {
                        Text("\(vm.completedThisMonth)")
                    }
                    LabeledContent("Total shots") {
                        Text("\(vm.entries.count)")
                    }
                }
            }
            .navigationTitle("Stats")
        }
    }
}

private struct SettingsView: View {
    @ObservedObject var vm: GLP1TrackerViewModel

    var body: some View {
        NavigationStack {
            Form {
                Section("Defaults") {
                    LabeledContent("Default dose") {
                        Text("\(vm.defaultDose, specifier: "%.2g") mg")
                    }
                }

                Section("Reminder") {
                    Toggle("Enable weekly reminder", isOn: $vm.reminderEnabled)
                    Stepper("Reminder hour: \(vm.reminderHour):00", value: $vm.reminderHour, in: 0...23)
                        .disabled(!vm.reminderEnabled)
                    Text("Notification wiring is the next step. Settings are persisted.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Settings")
        }
    }
}

#Preview {
    GLP1TrackerPrototypeView()
}
