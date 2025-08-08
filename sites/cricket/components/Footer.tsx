const Footer = () => {
    return (
        <footer className="mt-16 py-8 px-4 bg-base-200/50">
            <div className="container mx-auto">
                <p className="text-center pt-8 mt-8 border-t border-base-300 text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Cream11.
                </p>
            </div>
        </footer>
    );
};

export default Footer;