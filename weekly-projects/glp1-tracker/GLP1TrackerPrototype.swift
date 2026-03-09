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
    @Published var selectedDose: Double = 0.25
    @Published var selectedDate: Date = Date()
    @Published var note: String = ""

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

    func addInjection() {
        let entry = InjectionEntry(date: selectedDate, doseMg: selectedDose, note: note.trimmingCharacters(in: .whitespacesAndNewlines))
        entries.append(entry)
        entries.sort { $0.date > $1.date }
        note = ""
        selectedDate = Date()
    }

    func deleteEntries(at offsets: IndexSet) {
        entries.remove(atOffsets: offsets)
    }
}

struct GLP1TrackerPrototypeView: View {
    @StateObject private var vm = GLP1TrackerViewModel()

    private let doses: [Double] = [0.25, 0.5, 1.0, 1.7, 2.4]

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

                    Button("Add Injection") {
                        vm.addInjection()
                    }
                    .buttonStyle(.borderedProminent)
                }

                Section("History") {
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
                                        .font(.subheadline)
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

#Preview {
    GLP1TrackerPrototypeView()
}
