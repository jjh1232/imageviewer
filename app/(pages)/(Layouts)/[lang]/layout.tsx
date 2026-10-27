import { notFound } from "next/navigation";
import "./main.css";
import ThemeToggle from "@/app/(Component)/ThemeToggle";
import { LOCALES, LOCALE_LABELS, getDictionary, isLocale } from "@/app/(i18n)/main";

/** 목록에 없는 언어(/fr 등)는 만들지 않고 404 로 둔다. */
export const dynamicParams = false;

export function generateStaticParams() {
    return LOCALES.map((lang) => ({ lang }));
}

/*
 * <html> 은 app/layout.tsx 가 그린다. 예전 (Layouts)/layout.tsx 는 여기서 <html> 을
 * 한 번 더 그려 html 이 이중으로 겹쳐 있었다.
 */
export default async function MainLayout({ children, params }: LayoutProps<"/[lang]">) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();
    const t = getDictionary(lang);

    return (
        <div className="MAINLAYOUT">
            <header className="MAINLAYOUT-header">
                <a href={`/${lang}`} className="MAINLAYOUT-brand">
                    <span className="MAINLAYOUT-logo" aria-hidden="true">🖼️</span>
                    <span className="MAINLAYOUT-name">{t.name}</span>
                </a>
                <nav className="MAINLAYOUT-langs" aria-label="Language">
                    {LOCALES.map((l) => (
                        <a key={l} href={`/${l}`} hrefLang={l} aria-current={l === lang ? "page" : undefined}>
                            {LOCALE_LABELS[l]}
                        </a>
                    ))}
                    <ThemeToggle className="MAINLAYOUT-theme" labels={{ toLight: t.toLight, toDark: t.toDark }} />
                </nav>
            </header>

            <main className="MAINLAYOUT-main">{children}</main>

            <footer className="MAINLAYOUT-footer">© {new Date().getFullYear()} {t.name}</footer>
        </div>
    );
}
