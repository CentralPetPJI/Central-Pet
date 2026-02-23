const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed left-0 bottom-0 w-full h-[7vh] border-t border-gray-300 bg-linear-to-r from-white to-cyan-200 bg-opacity-80 text-center flex justify-center items-center z-50">
      <p className="text-gray-900 opacity-80">Central Pet - {currentYear}</p>
    </footer>
  );
};

export default Footer;
