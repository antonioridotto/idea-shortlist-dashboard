import SwiftUI

struct Session: Identifiable {
    let id = UUID()
    let title: String
    let subtitle: String
    let minutes: Int
    let icon: String
    let tint: Color
}

struct ContentView: View {
    @State private var selected: UUID?

    private let sessions: [Session] = [
        .init(title: "Deep Focus", subtitle: "Beta 40Hz • Rain Texture", minutes: 25, icon: "brain.head.profile", tint: .cyan),
        .init(title: "Calm Breath", subtitle: "Alpha 10Hz • Soft Air", minutes: 15, icon: "wind", tint: .mint),
        .init(title: "Sleep Drift", subtitle: "Delta 2Hz • Night Waves", minutes: 45, icon: "moon.zzz", tint: .indigo)
    ]

    var body: some View {
        NavigationStack {
            ZStack {
                background

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 18) {
                        header

                        ForEach(sessions) { session in
                            sessionCard(session)
                        }

                        primaryButton
                    }
                    .padding(.horizontal, 18)
                    .padding(.bottom, 28)
                }
            }
            .navigationBarHidden(true)
        }
    }

    private var background: some View {
        ZStack {
            LinearGradient(colors: [Color(red: 0.07, green: 0.1, blue: 0.18), Color.black], startPoint: .topLeading, endPoint: .bottomTrailing)
                .ignoresSafeArea()

            Circle()
                .fill(.cyan.opacity(0.2))
                .frame(width: 260)
                .blur(radius: 70)
                .offset(x: 120, y: -250)

            Circle()
                .fill(.purple.opacity(0.22))
                .frame(width: 320)
                .blur(radius: 90)
                .offset(x: -130, y: 260)
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 10) {
                Image(systemName: "waveform.path.ecg.rectangle")
                    .font(.title3.weight(.semibold))
                    .foregroundStyle(.white)
                    .padding(10)
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12, style: .continuous))

                VStack(alignment: .leading, spacing: 2) {
                    Text("Anima")
                        .font(.system(size: 34, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                    Text("Focus and sleep, beautifully")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.72))
                }
                Spacer()
            }

            HStack {
                Label("Today", systemImage: "calendar")
                Spacer()
                Text("3 presets")
            }
            .font(.footnote.weight(.medium))
            .foregroundStyle(.white.opacity(0.78))
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        }
        .padding(.top, 8)
    }

    private func sessionCard(_ session: Session) -> some View {
        let isSelected = selected == session.id

        return Button {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.82)) {
                selected = session.id
            }
        } label: {
            HStack(spacing: 14) {
                Image(systemName: session.icon)
                    .font(.title3)
                    .foregroundStyle(session.tint)
                    .frame(width: 42, height: 42)
                    .background(session.tint.opacity(0.12), in: RoundedRectangle(cornerRadius: 12, style: .continuous))

                VStack(alignment: .leading, spacing: 5) {
                    Text(session.title)
                        .font(.headline)
                        .foregroundStyle(.white)
                    Text(session.subtitle)
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.7))
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 6) {
                    Text("\(session.minutes)m")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.white)
                    Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                        .font(.headline)
                        .foregroundStyle(isSelected ? .mint : .white.opacity(0.5))
                }
            }
            .padding(14)
            .background(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(.ultraThinMaterial)
                    .overlay(
                        RoundedRectangle(cornerRadius: 18, style: .continuous)
                            .stroke(isSelected ? .white.opacity(0.45) : .white.opacity(0.18), lineWidth: 1)
                    )
            )
            .shadow(color: .black.opacity(0.18), radius: 12, y: 8)
        }
        .buttonStyle(.plain)
    }

    private var primaryButton: some View {
        Button {
            if selected == nil { selected = sessions.first?.id }
        } label: {
            HStack {
                Image(systemName: "play.fill")
                Text("Start Session")
                    .fontWeight(.semibold)
            }
            .font(.headline)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 15)
            .foregroundStyle(.black)
            .background(
                LinearGradient(colors: [.mint, .cyan], startPoint: .leading, endPoint: .trailing),
                in: RoundedRectangle(cornerRadius: 16, style: .continuous)
            )
            .shadow(color: .cyan.opacity(0.35), radius: 14, y: 8)
        }
        .padding(.top, 6)
    }
}
