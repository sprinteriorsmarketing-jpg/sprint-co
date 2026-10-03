<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <meta name="theme-color" content="#172117">
    <title>We’ll be right back | SprintCo</title>
    <style>
        :root {
            color-scheme: light;
            --ink: #172117;
            --muted: #617064;
            --paper: #f3f1e9;
            --lime: #d7f35a;
            --coral: #ff765c;
            --line: rgba(23, 33, 23, .15);
        }

        * { box-sizing: border-box; }

        html, body { min-height: 100%; }

        body {
            margin: 0;
            min-height: 100vh;
            min-height: 100svh;
            display: grid;
            place-items: center;
            overflow-x: hidden;
            color: var(--ink);
            background:
                radial-gradient(circle at 8% 10%, rgba(215, 243, 90, .44), transparent 24rem),
                radial-gradient(circle at 94% 88%, rgba(255, 118, 92, .25), transparent 26rem),
                var(--paper);
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .noise {
            position: fixed;
            inset: 0;
            pointer-events: none;
            opacity: .22;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.15'/%3E%3C/svg%3E");
        }

        main {
            position: relative;
            width: min(1120px, calc(100% - 32px));
            min-height: min(720px, calc(100svh - 32px));
            display: grid;
            grid-template-rows: auto 1fr auto;
            padding: clamp(24px, 4vw, 56px);
            border: 1px solid var(--line);
            border-radius: 32px;
            background: rgba(255, 255, 255, .48);
            box-shadow: 0 30px 90px rgba(35, 49, 34, .12);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            isolation: isolate;
            overflow: hidden;
        }

        header, footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
        }

        .brand {
            display: inline-flex;
            align-items: center;
            gap: 11px;
            color: inherit;
            font-size: 21px;
            font-weight: 800;
            letter-spacing: -.04em;
            text-decoration: none;
        }

        .brand-mark {
            width: 34px;
            height: 34px;
            display: grid;
            place-items: center;
            border-radius: 50%;
            color: var(--paper);
            background: var(--ink);
            font-size: 13px;
            letter-spacing: -.06em;
        }

        .status {
            display: inline-flex;
            align-items: center;
            gap: 9px;
            padding: 9px 13px;
            border: 1px solid var(--line);
            border-radius: 999px;
            color: var(--muted);
            background: rgba(255, 255, 255, .5);
            font-size: 12px;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--coral);
            box-shadow: 0 0 0 5px rgba(255, 118, 92, .15);
            animation: pulse 2s ease-in-out infinite;
        }

        .content {
            align-self: center;
            max-width: 780px;
            padding: clamp(64px, 10vh, 112px) 0;
        }

        .eyebrow {
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 0 0 24px;
            color: var(--muted);
            font-size: 13px;
            font-weight: 800;
            letter-spacing: .14em;
            text-transform: uppercase;
        }

        .eyebrow::before {
            content: "";
            width: 38px;
            height: 2px;
            background: var(--ink);
        }

        h1 {
            max-width: 720px;
            margin: 0;
            font-size: clamp(52px, 9vw, 112px);
            font-weight: 800;
            letter-spacing: -.075em;
            line-height: .88;
        }

        h1 span {
            position: relative;
            display: inline-block;
            z-index: 0;
        }

        h1 span::after {
            content: "";
            position: absolute;
            left: -.02em;
            right: -.08em;
            bottom: .02em;
            height: .23em;
            border-radius: 999px;
            background: var(--lime);
            transform: rotate(-1.5deg);
            z-index: -1;
        }

        .message {
            max-width: 590px;
            margin: 32px 0 0;
            color: var(--muted);
            font-size: clamp(17px, 2vw, 21px);
            line-height: 1.65;
        }

        footer {
            padding-top: 22px;
            border-top: 1px solid var(--line);
            color: var(--muted);
            font-size: 13px;
        }

        footer a {
            color: var(--ink);
            font-weight: 700;
            text-decoration-thickness: 1px;
            text-underline-offset: 4px;
        }

        .orb {
            position: absolute;
            right: clamp(-130px, -8vw, -65px);
            top: 21%;
            width: clamp(220px, 30vw, 390px);
            aspect-ratio: 1;
            border: 1px solid rgba(23, 33, 23, .14);
            border-radius: 48% 52% 65% 35% / 48% 36% 64% 52%;
            background: var(--coral);
            box-shadow: inset 30px -30px 70px rgba(97, 24, 11, .12);
            transform: rotate(14deg);
            z-index: -1;
            animation: float 7s ease-in-out infinite;
        }

        .orb::before,
        .orb::after {
            content: "";
            position: absolute;
            border: 1px solid rgba(23, 33, 23, .18);
            border-radius: 50%;
        }

        .orb::before { inset: 18%; }
        .orb::after { inset: 35%; background: var(--lime); }

        @keyframes float {
            0%, 100% { transform: rotate(14deg) translateY(0); }
            50% { transform: rotate(18deg) translateY(-14px); }
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(.8); opacity: .65; }
        }

        @media (max-width: 720px) {
            main {
                width: min(100% - 20px, 1120px);
                min-height: calc(100svh - 20px);
                border-radius: 24px;
            }

            .status { padding: 9px; }
            .status-label { display: none; }
            .content { padding: 72px 0 100px; }
            .message { max-width: 88%; }
            .orb { top: auto; bottom: 70px; opacity: .7; }
            footer { align-items: flex-end; }
            footer span { max-width: 210px; }
        }

        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after { animation: none !important; }
        }
    </style>
</head>
<body>
    <div class="noise" aria-hidden="true"></div>

    <main>
        <header>
            <a class="brand" href="{{ config('app.url') }}" aria-label="SprintCo home">
                <img src="https://www.sprint-co.com/wp-content/uploads/2025/03/sprintco-secondary-logo.svg">
            </a>
            <div class="status" role="status">
                <span class="status-dot" aria-hidden="true"></span>
                <span class="status-label">Maintenance in progress</span>
            </div>
        </header>

        <section class="content">
            <p class="eyebrow">A quick creative pause</p>
            <h1>We’re making things <span>better.</span></h1>
            <p class="message">
                Our workspace is getting a thoughtful upgrade. We’ll be back shortly—faster,
                sharper, and ready to help you create remarkable spaces.
            </p>
        </section>

        <footer>
            <span>Thank you for your patience.</span>
            <a href="mailto:info@sprint-co.com">info@sprint-co.com</a>
        </footer>

        <div class="orb" aria-hidden="true"></div>
    </main>
</body>
</html>




// <?php
// /**
//  * Front to the WordPress application. This file doesn't do anything, but loads
//  * wp-blog-header.php which does and tells WordPress to load the theme.
//  *
//  * @package WordPress
//  */

// /**
//  * Tells WordPress to load the WordPress theme and output it.
//  *
//  * @var bool
//  */
// define( 'WP_USE_THEMES', true );

// /** Loads the WordPress Environment and Template */
// require __DIR__ . '/wp-blog-header.php';
