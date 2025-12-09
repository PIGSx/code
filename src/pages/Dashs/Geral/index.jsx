import { useTheme } from "../../../context/ThemeContext";
import DashboardLayout from "../../../components/Layouts/DashboardLayout";

const Geral = () => {
  const { theme } = useTheme();

  return (
    <DashboardLayout>
      <div
        className={`w-full h-full p-4 transition-colors duration-300 ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <iframe
          title="DASH 2"
          src="https://app.powerbi.com/reportEmbed?reportId=274328ad-f3ed-473b-8161-57e71fedecb9&autoAuth=true&ctid=38ae2f02-5710-4e12-80bb-83600c3fdf1e"
          className="w-full h-[85vh] rounded-xl border-0 shadow-lg"
          allowFullScreen
        />
      </div>
    </DashboardLayout>
  );
};

export default Geral;
