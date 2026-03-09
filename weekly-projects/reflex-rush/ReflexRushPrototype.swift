import SwiftUI

struct Target: Identifiable {
    let id = UUID()
    let lane: Int
    var y: CGFloat = -40
    let speed: CGFloat
}

final class ReflexRushViewModel: ObservableObject {
    @Published var score = 0
    @Published var misses = 0
    @Published var streak = 0
    @Published var isRunning = false
    @Published var target: Target?

    private var tickTask: Task<Void, Never>?
    private var rng = SeededGenerator(seed: 42)

    func start(seed: UInt64 = 42) {
        reset(seed: seed)
        isRunning = true
        tickTask?.cancel()
        tickTask = Task { @MainActor in
            while !Task.isCancelled, isRunning {
                tick()
                try? await Task.sleep(nanoseconds: 60_000_000)
            }
        }
    }

    func reset(seed: UInt64 = 42) {
        score = 0
        misses = 0
        streak = 0
        isRunning = false
        target = nil
        rng = SeededGenerator(seed: seed)
    }

    func tapLane(_ lane: Int) {
        guard isRunning else { return }
        guard let t = target else {
            misses += 1
            streak = 0
            return
        }

        if t.lane == lane {
            streak += 1
            score += 10 + (streak / 3) * 5
            target = nil
        } else {
            misses += 1
            streak = 0
        }
    }

    private func tick() {
        guard isRunning else { return }

        if target == nil {
            let lane = Int.random(in: 0...2, using: &rng)
            let speed = [1.5, 2.4, 3.2].randomElement(using: &rng) ?? 2.0
            target = Target(lane: lane, speed: speed)
        } else {
            target!.y += target!.speed * 8
            if target!.y > 620 {
                misses += 1
                streak = 0
                target = nil
            }
        }

        if misses >= 10 { isRunning = false }
    }
}

struct ReflexRushPrototypeView: View {
    @StateObject private var vm = ReflexRushViewModel()

    var body: some View {
        VStack(spacing: 16) {
            HStack(spacing: 16) {
                Stat(title: "Score", value: vm.score)
                Stat(title: "Streak", value: vm.streak)
                Stat(title: "Misses", value: vm.misses)
            }

            ZStack(alignment: .topLeading) {
                RoundedRectangle(cornerRadius: 16).fill(.black.opacity(0.9))

                HStack(spacing: 8) {
                    ForEach(0..<3, id: \.self) { _ in
                        RoundedRectangle(cornerRadius: 12)
                            .fill(.white.opacity(0.06))
                    }
                }
                .padding(10)

                if let target = vm.target {
                    Circle()
                        .fill(.red)
                        .frame(width: 36, height: 36)
                        .offset(x: laneX(target.lane), y: target.y)
                        .animation(.linear(duration: 0.05), value: target.y)
                }
            }
            .frame(height: 620)

            HStack(spacing: 8) {
                ForEach(0..<3, id: \.self) { lane in
                    Button("Lane \(lane + 1)") { vm.tapLane(lane) }
                        .buttonStyle(.borderedProminent)
                        .frame(maxWidth: .infinity)
                }
            }

            HStack {
                Button(vm.isRunning ? "Restart" : "Start") {
                    vm.start(seed: 42)
                }
                .buttonStyle(.borderedProminent)

                Button("Stop") {
                    vm.reset(seed: 42)
                }
                .buttonStyle(.bordered)
            }
        }
        .padding()
        .background(Color.gray.opacity(0.12))
    }

    private func laneX(_ lane: Int) -> CGFloat {
        let laneWidth: CGFloat = 115
        return 24 + CGFloat(lane) * (laneWidth + 8)
    }
}

struct Stat: View {
    let title: String
    let value: Int

    var body: some View {
        VStack {
            Text(title).font(.caption).foregroundStyle(.secondary)
            Text("\(value)").font(.title3).bold()
        }
        .frame(maxWidth: .infinity)
        .padding(10)
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

struct SeededGenerator: RandomNumberGenerator {
    private var state: UInt64

    init(seed: UInt64) { self.state = seed }

    mutating func next() -> UInt64 {
        state = 6364136223846793005 &* state &+ 1
        return state
    }
}

#Preview {
    ReflexRushPrototypeView()
}
