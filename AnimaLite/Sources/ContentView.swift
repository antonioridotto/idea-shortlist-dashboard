import SwiftUI

struct SessionPreset: Identifiable {
    let id = UUID()
    let title: String
    let subtitle: String
    let minutes: Int
    let icon: String
}

struct ContentView: View {
    @AppStorage("hasSeenOnboarding") private var hasSeenOnboarding = false

    private var debugScreen: String? {
        let args = ProcessInfo.processInfo.arguments
        guard let idx = args.firstIndex(of: "--debug-screen"), idx + 1 < args.count else { return nil }
        return args[idx + 1]
    }

    var body: some View {
        Group {
            if let debugScreen {
                switch debugScreen {
                case "onboarding1":
                    OnboardingPage(title: "Focus in Minutes", subtitle: "Binaural sessions designed for deep work.", icon: "brain.head.profile")
                        .background(LinearGradient(colors: [Color.black, Color(red: 0.05, green: 0.08, blue: 0.16)], startPoint: .topLeading, endPoint: .bottomTrailing).ignoresSafeArea())
                case "onboarding2":
                    OnboardingPage(title: "Sleep Better", subtitle: "Calming waves to wind down naturally.", icon: "moon.zzz.fill")
                        .background(LinearGradient(colors: [Color.black, Color(red: 0.05, green: 0.08, blue: 0.16)], startPoint: .topLeading, endPoint: .bottomTrailing).ignoresSafeArea())
                case "onboarding3":
                    OnboardingPage(title: "Track Progress", subtitle: "Build your streak and stay consistent.", icon: "chart.line.uptrend.xyaxis")
                        .background(LinearGradient(colors: [Color.black, Color(red: 0.05, green: 0.08, blue: 0.16)], startPoint: .topLeading, endPoint: .bottomTrailing).ignoresSafeArea())
                case "rate":
                    RateUsScreen(onContinue: {})
                case "paywall":
                    IntroPaywallScreen(onClose: {})
                case "settings":
                    SettingsScreen()
                default:
                    MainTabView()
                }
            } else if hasSeenOnboarding {
                MainTabView()
            } else {
                LaunchFlow {
                    hasSeenOnboarding = true
                }
            }
        }
    }
}

// MARK: - Launch Flow (Onboarding -> Rate Us -> Paywall)

enum LaunchStep {
    case onboarding
    case rateUs
    case paywall
}

struct LaunchFlow: View {
    @State private var step: LaunchStep = .onboarding
    @State private var page = 0
    let onFinish: () -> Void

    var body: some View {
        Group {
            switch step {
            case .onboarding:
                onboarding
            case .rateUs:
                RateUsScreen {
                    withAnimation(.easeInOut) { step = .paywall }
                }
            case .paywall:
                IntroPaywallScreen {
                    onFinish()
                }
            }
        }
    }

    private var onboarding: some View {
        ZStack {
            LinearGradient(colors: [Color.black, Color(red: 0.05, green: 0.08, blue: 0.16)], startPoint: .topLeading, endPoint: .bottomTrailing)
                .ignoresSafeArea()

            TabView(selection: $page) {
                OnboardingPage(title: "Focus in Minutes", subtitle: "Binaural sessions designed for deep work.", icon: "brain.head.profile").tag(0)
                OnboardingPage(title: "Sleep Better", subtitle: "Calming waves to wind down naturally.", icon: "moon.zzz.fill").tag(1)
                OnboardingPage(title: "Track Progress", subtitle: "Build your streak and stay consistent.", icon: "chart.line.uptrend.xyaxis").tag(2)
            }
            .tabViewStyle(.page(indexDisplayMode: .always))

            VStack {
                Spacer()
                Button(page == 2 ? "Continue" : "Next") {
                    if page < 2 {
                        withAnimation(.easeInOut) { page += 1 }
                    } else {
                        withAnimation(.easeInOut) { step = .rateUs }
                    }
                }
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 15)
                .background(.white, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                .foregroundStyle(.black)
                .padding(.horizontal, 18)
                .padding(.bottom, 24)
            }
        }
    }
}

struct OnboardingPage: View {
    let title: String
    let subtitle: String
    let icon: String

    var body: some View {
        VStack(spacing: 22) {
            Spacer()
            Image(systemName: icon)
                .font(.system(size: 88, weight: .light))
                .foregroundStyle(.white)
            Text(title)
                .font(.system(size: 34, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
                .multilineTextAlignment(.center)
            Text(subtitle)
                .font(.title3)
                .foregroundStyle(.white.opacity(0.75))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 28)
            Spacer()
            Spacer()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

struct RateUsScreen: View {
    let onContinue: () -> Void

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color.black, Color.indigo.opacity(0.9)], startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()

            VStack(spacing: 18) {
                Spacer()
                Image(systemName: "star.bubble.fill")
                    .font(.system(size: 72))
                    .foregroundStyle(.yellow)

                Text("Help us improve")
                    .font(.system(size: 34, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)

                Text("If you enjoy Anima, please rate us. It helps us build better sessions for everyone.")
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.white.opacity(0.75))
                    .padding(.horizontal, 24)

                HStack(spacing: 10) {
                    ForEach(0..<5) { _ in
                        Image(systemName: "star.fill")
                            .foregroundStyle(.yellow)
                    }
                }
                .font(.title2)

                Spacer()

                Button("Rate Now") {
                    onContinue()
                }
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 15)
                .background(.white, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                .foregroundStyle(.black)

                Button("Maybe Later") {
                    onContinue()
                }
                .foregroundStyle(.white.opacity(0.8))
                .padding(.bottom, 20)
            }
            .padding(.horizontal, 18)
        }
    }
}

struct IntroPaywallScreen: View {
    @State private var selectedPlan = "weekly"
    let onClose: () -> Void

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color.black, Color(red: 0.08, green: 0.1, blue: 0.2)], startPoint: .topLeading, endPoint: .bottomTrailing)
                .ignoresSafeArea()

            VStack(spacing: 16) {
                Spacer(minLength: 20)

                Text("Unlock Anima Premium")
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
                    .multilineTextAlignment(.center)

                Text("3-day free trial on weekly plan")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.mint)

                VStack(spacing: 12) {
                    planCard(
                        id: "weekly",
                        title: "Weekly",
                        subtitle: "3-day free trial, then $6.99/week"
                    )

                    planCard(
                        id: "yearly",
                        title: "Yearly",
                        subtitle: "$39.99/year (best value)"
                    )
                }

                Button("Continue") {
                    onClose()
                }
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 15)
                .background(.white, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                .foregroundStyle(.black)
                .padding(.top, 6)

                Button("Restore Purchases") {}
                    .foregroundStyle(.white.opacity(0.75))
                    .font(.footnote)

                Button("Not now") {
                    onClose()
                }
                .foregroundStyle(.white.opacity(0.65))
                .font(.footnote)
                .padding(.bottom, 18)
            }
            .padding(.horizontal, 18)
        }
    }

    @ViewBuilder
    private func planCard(id: String, title: String, subtitle: String) -> some View {
        Button {
            selectedPlan = id
        } label: {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                        .foregroundStyle(.white)
                    Text(subtitle)
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.74))
                }
                Spacer()
                Image(systemName: selectedPlan == id ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(selectedPlan == id ? .mint : .white.opacity(0.5))
                    .font(.title3)
            }
            .padding(14)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .stroke(selectedPlan == id ? .mint : .white.opacity(0.2), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Main App

struct MainTabView: View {
    var body: some View {
        TabView {
            SessionsView()
                .tabItem { Label("Sessions", systemImage: "waveform") }

            ProgressViewScreen()
                .tabItem { Label("Progress", systemImage: "chart.bar") }

            SettingsScreen()
                .tabItem { Label("Settings", systemImage: "gearshape") }
        }
        .tint(.cyan)
    }
}

struct SessionsView: View {
    @State private var showPaywall = false
    @State private var selected = 0

    private let presets: [SessionPreset] = [
        .init(title: "Deep Focus", subtitle: "Beta 40Hz + Rain", minutes: 25, icon: "brain.head.profile"),
        .init(title: "Calm Breath", subtitle: "Alpha 10Hz + Wind", minutes: 15, icon: "wind"),
        .init(title: "Night Drift", subtitle: "Delta 2Hz + Ocean", minutes: 45, icon: "moon.zzz")
    ]

    var body: some View {
        NavigationStack {
            ZStack {
                LinearGradient(colors: [Color(red: 0.04, green: 0.06, blue: 0.12), .black], startPoint: .top, endPoint: .bottom)
                    .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 14) {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Your Mind, Tuned")
                                .font(.system(size: 30, weight: .bold, design: .rounded))
                                .foregroundStyle(.white)
                            Text("Choose a preset and start your session.")
                                .foregroundStyle(.white.opacity(0.72))
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(18)
                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 18, style: .continuous))

                        ForEach(Array(presets.enumerated()), id: \.offset) { idx, preset in
                            Button {
                                selected = idx
                            } label: {
                                HStack(spacing: 14) {
                                    Image(systemName: preset.icon)
                                        .font(.title3)
                                        .frame(width: 42, height: 42)
                                        .background(.white.opacity(0.08), in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                                        .foregroundStyle(.white)

                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(preset.title)
                                            .font(.headline)
                                            .foregroundStyle(.white)
                                        Text(preset.subtitle)
                                            .font(.subheadline)
                                            .foregroundStyle(.white.opacity(0.72))
                                    }
                                    Spacer()
                                    Text("\(preset.minutes)m")
                                        .font(.subheadline.weight(.bold))
                                        .foregroundStyle(.white)
                                }
                                .padding(14)
                                .background(
                                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                                        .fill(.ultraThinMaterial)
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                                .stroke(selected == idx ? .cyan : .white.opacity(0.2), lineWidth: 1)
                                        )
                                )
                            }
                            .buttonStyle(.plain)
                        }

                        Button("Start Session") {}
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                            .background(
                                LinearGradient(colors: [.cyan, .blue], startPoint: .leading, endPoint: .trailing),
                                in: RoundedRectangle(cornerRadius: 14, style: .continuous)
                            )
                            .foregroundStyle(.white)

                        Button("Unlock Premium") {
                            showPaywall = true
                        }
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.white.opacity(0.9))
                    }
                    .padding(16)
                }
            }
            .navigationTitle("Anima")
            .navigationBarTitleDisplayMode(.inline)
            .sheet(isPresented: $showPaywall) {
                IntroPaywallScreen {}
            }
        }
    }
}

struct ProgressViewScreen: View {
    var body: some View {
        NavigationStack {
            List {
                Section("This Week") {
                    Label("5 sessions completed", systemImage: "checkmark.circle")
                    Label("132 total minutes", systemImage: "timer")
                    Label("2 day streak", systemImage: "flame")
                }
            }
            .navigationTitle("Progress")
        }
    }
}

struct SettingsScreen: View {
    @State private var haptics = true
    @State private var notifications = true

    var body: some View {
        NavigationStack {
            List {
                Section("Playback") {
                    Toggle("Haptics", isOn: $haptics)
                    Toggle("Session Reminders", isOn: $notifications)
                }
                Section("About") {
                    Label("Version 1.0", systemImage: "info.circle")
                    Label("Privacy Policy", systemImage: "hand.raised")
                }
            }
            .navigationTitle("Settings")
        }
    }
}
