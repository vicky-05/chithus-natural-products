
import appComingSoonImage from "../assets/app-coming-soon.png";

export default function AppComingSoon() {
  return (
    <section className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#f8f5e9] shadow-sm">
        <img
          src={appComingSoonImage}
          alt="Chithu's Natural Products App Coming Soon"
          className="block h-auto w-full"
          loading="lazy"
        />
      </div>
    </section>
  );
}
