import { Link } from "react-router-dom";
import { Baby, Heart, Truck, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/products/ProductCard";
import { CategorySidebar } from "../components/layouts/CategorySidebar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay"

const features = [
  {
    icon: Baby,
    title: "Sản phẩm chính hãng",
    description: "Cam kết 100% sản phẩm nhập khẩu chính hãng",
  },
  {
    icon: Truck,
    title: "Giao hàng nhanh",
    description: "Miễn phí giao hàng cho đơn từ 500K",
  },
  {
    icon: Heart,
    title: "Tư vấn tận tâm",
    description: "Đội ngũ chuyên gia dinh dưỡng hỗ trợ 24/7",
  },
  {
    icon: Shield,
    title: "Bảo hành đổi trả",
    description: "Đổi trả miễn phí trong vòng 7 ngày",
  },
];

// Mock data for categories
const categories = [
  { id: 1, name: "Sữa cho bé", slug: "sua-cho-be" },
  { id: 2, name: "Sữa bầu", slug: "sua-bau" },
  { id: 3, name: "Dinh dưỡng", slug: "dinh-duong" },
  { id: 4, name: "Đồ dùng", slug: "do-dung" },
  { id: 5, name: "Chăm sóc", slug: "cham-soc" },
  { id: 6, name: "Chăm sóc", slug: "cham-soc" },
  { id: 7, name: "Chăm sóc", slug: "cham-soc" },
];

// Mock data for featured products
const featuredProducts = [
  {
    id: 1,
    name: "Sữa Enfamil A+ 1 cho trẻ từ 0-6 tháng (900g)",
    slug: "sua-enfamil-a-plus-1",
    price: 580000,
    sale_price: 520000,
    image_url: "https://via.placeholder.com/400x400?text=Enfamil+A%2B+1",
    stock: 50,
    brand: { name: "Enfamil" },
    is_featured: true,
    reviews: 128,
  },
  {
    id: 2,
    name: "Sữa Abbott Similac Eye-Q 4 HMO (900g)",
    slug: "sua-similac-eye-q-4",
    price: 450000,
    sale_price: 399000,
    image_url: "https://via.placeholder.com/400x400?text=Similac+Eye-Q",
    stock: 35,
    brand: { name: "Abbott" },
    is_featured: true,
    reviews: 89,
  },
  {
    id: 3,
    name: "Sữa Aptamil Đức số 2 (800g)",
    slug: "sua-aptamil-duc-so-2",
    price: 650000,
    sale_price: null,
    image_url: "https://via.placeholder.com/400x400?text=Aptamil+2",
    stock: 20,
    brand: { name: "Aptamil" },
    is_featured: false,
    reviews: 67,
  },
  {
    id: 4,
    name: "Sữa Nan Optipro 3 (800g)",
    slug: "sua-nan-optipro-3",
    price: 380000,
    sale_price: 350000,
    image_url: "https://via.placeholder.com/400x400?text=NAN+Optipro",
    stock: 0,
    brand: { name: "Nestlé" },
    is_featured: true,
    reviews: 156,
  },
  {
    id: 5,
    name: "Sữa Friso Gold 4 (1500g)",
    slug: "sua-friso-gold-4",
    price: 720000,
    sale_price: 680000,
    image_url: "https://via.placeholder.com/400x400?text=Friso+Gold",
    stock: 42,
    brand: { name: "Friso" },
    is_featured: true,
    reviews: 201,
  },
  {
    id: 6,
    name: "Sữa Vinamilk Dielac Alpha Gold 4 (900g)",
    slug: "sua-dielac-alpha-gold-4",
    price: 320000,
    sale_price: 285000,
    image_url: "https://via.placeholder.com/400x400?text=Dielac+Alpha",
    stock: 78,
    brand: { name: "Vinamilk" },
    is_featured: false,
    reviews: 94,
  },
  {
    id: 7,
    name: "Sữa Ensure Gold Vanilla (850g)",
    slug: "sua-ensure-gold-vanilla",
    price: 580000,
    sale_price: 520000,
    image_url: "https://via.placeholder.com/400x400?text=Ensure+Gold",
    stock: 30,
    brand: { name: "Abbott" },
    is_featured: true,
    reviews: 112,
  },
  {
    id: 8,
    name: "Sữa Nutricare Bone (900g)",
    slug: "sua-nutricare-bone",
    price: 450000,
    sale_price: null,
    image_url: "https://via.placeholder.com/400x400?text=Nutricare",
    stock: 25,
    brand: { name: "Nutricare" },
    is_featured: false,
    reviews: 45,
  },
];

export default function Index() {
  const productsLoading = false;
  const categoriesLoading = false;

  return (
    <>
      {/* Hero Section */}
      <div className="container mx-auto p-4 py-6">
        <div className="flex gap-5">
          {/* Category Sidebar */}
          <CategorySidebar />

          {/* Main Content */}
          <div className="flex-1">
            {/* Hero Section */}
            <section className="bg-white rounded-lg border border-border overflow-hidden">
              <Carousel
                className="relative"
                plugins={[
                  Autoplay({
                    delay: 6000,
                  }),
                ]}
              >
                <CarouselContent>
                  <CarouselItem className="pl-0">
                    <div className="w-full h-full bg-amber-200 aspect-3/1 flex items-center justify-center">
                      1 aa
                    </div>
                  </CarouselItem>
                  <CarouselItem className="pl-0">
                    <div className="w-full h-full bg-green-200 aspect-3/1 flex items-center justify-center">
                      2
                    </div>
                  </CarouselItem>
                  <CarouselItem className="pl-0">
                    <div className="w-full h-full bg-blue-200 aspect-3/1 flex items-center justify-center">
                      3
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className={"ml-16"} />
                <CarouselNext className="mr-16" />
              </Carousel>
            </section>
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center p-4"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-medium text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Khám phá các sản phẩm từ các thương hiệu uy tín
            </h2>
            <Button variant="ghost" asChild>
              <Link to="/san-pham">
                Xem tất cả
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoriesLoading
              ? Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                  ))
              : categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/san-pham?category=${category.slug}`}
                  >
                    <Card className="hover:ring hover:ring-primary transition-all cursor-pointer group shadow-none">
                      <CardContent className="p-1 text-center">
                        <p>Logo</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Sản phẩm nổi bật
            </h2>
            <Button variant="ghost" asChild>
              <Link to="/san-pham">
                Xem tất cả
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {productsLoading
              ? Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-80 rounded-xl" />
                  ))
              : featuredProducts
                  .slice(0, 8)
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}

      {/* CTA Section */}
      <section className="py-16 bg-linear-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            Đăng ký thành viên ngay hôm nay!
          </h2>
          <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Nhận ngay voucher giảm 10% cho đơn hàng đầu tiên. Tích điểm đổi quà
            hấp dẫn và nhiều ưu đãi độc quyền khác.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/dang-ky">Đăng ký ngay</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
