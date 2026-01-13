function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-pink-600">MomBabyMilk</h1>
            <nav className="space-x-6">
              <a href="#" className="text-gray-700 hover:text-pink-600">Home</a>
              <a href="#" className="text-gray-700 hover:text-pink-600">Products</a>
              <a href="#" className="text-gray-700 hover:text-pink-600">About</a>
              <a href="#" className="text-gray-700 hover:text-pink-600">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-800 mb-4">
            Premium Milk Products for Moms & Babies
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Nourishing your family with the best quality milk and baby care products
          </p>
          <button className="bg-pink-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-pink-700 transition duration-300">
            Shop Now
          </button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-3xl font-bold text-center mb-8">Product Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300">
            <div className="text-center">
              <div className="text-6xl mb-4">🍼</div>
              <h4 className="text-xl font-bold mb-2">Baby Formula</h4>
              <p className="text-gray-600">Nutritious formula for healthy growth</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300">
            <div className="text-center">
              <div className="text-6xl mb-4">🥛</div>
              <h4 className="text-xl font-bold mb-2">Baby Food</h4>
              <p className="text-gray-600">Organic and healthy baby food options</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300">
            <div className="text-center">
              <div className="text-6xl mb-4">👶</div>
              <h4 className="text-xl font-bold mb-2">Accessories</h4>
              <p className="text-gray-600">Essential baby care accessories</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 MomBabyMilk. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
