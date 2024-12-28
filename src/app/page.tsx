import Header from "@/components/layout/Header";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
// import ManualBuildPC from "@/pages/manual-build-pc/ManualBuildPC";
import AutoBuildPC from "@/pages/auto-build-pc/AutoBuildPC";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Header />
      <Navigation />
      <Breadcrumb />
      <AutoBuildPC />
      <Footer />
    </div>
  );
}
