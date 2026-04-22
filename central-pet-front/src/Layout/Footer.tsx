const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-300 bg-linear-to-r from-white to-cyan-200">
      <div className="mx-auto flex min-h-14 w-full max-w-[1440px] items-center justify-center px-4 py-3 text-center lg:px-6">
        <p className="text-gray-900 opacity-80">
          {import.meta.env.VITE_SITE ?? 'Centrau Pet'} - {currentYear}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
