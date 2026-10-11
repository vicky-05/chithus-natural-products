import bannerImage from "../assets/how-to-order-banner.png";

export default function HowToOrderSection() {
  return (
    <section className="w-full overflow-hidden bg-[#FAF7EF] py-5 sm:py-8">
      <div className="mx-auto w-full max-w-[1600px] px-3 sm:px-5 lg:px-8">
        <div className="overflow-hidden rounded-2xl sm:rounded-3xl">
          <img
            src={bannerImage}
            alt="How to place an order at Chithu's Natural Products"
            className="block h-auto w-full object-contain"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}