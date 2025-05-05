import Header from '@/components/home/Header';
import HeroBanner from '@/components/home/HeroBanner';
import BookFilter from '@/components/home/BookFilter';
import LatestBooksSection from '@/components/home/LatestBooksSection';
import CategorySection from '@/components/home/CategorySection';
import ProcessSection from '@/components/home/ProcessSection';
import Footer from '@/components/home/Footer';

export default function Home() {
    return (
        <div className="min-h-screen bg-white text-gray-900">
            <Header />
            <main>
                <HeroBanner />
                <BookFilter />
                <LatestBooksSection />
                <CategorySection />
                <ProcessSection />
            </main>
            <Footer />
        </div>
    );
}
