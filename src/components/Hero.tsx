import heroImage from '@/assets/hero-riad.jpg';

const Hero = () => {
  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `
            linear-gradient(to bottom, white, rgba(255,255,255,0)),
            url(${heroImage})
          `
        }}
      >

        <div className="absolute inset-0 gradient-overlay"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center text-white px-6 max-w-5xl mx-auto">
          <div className="fade-in-up animate">
            <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-light mb-8 tracking-widest leading-none">
              MystigTravel
            </h1>
            <div className="w-24 h-px bg-white/60 mx-auto mb-8"></div>
            <p className="font-elegant text-lg md:text-xl font-light tracking-[0.3em] uppercase opacity-80">
              Voyages d'Exception
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;