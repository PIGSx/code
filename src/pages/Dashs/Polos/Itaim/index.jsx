import { useTheme } from "../../../../context/ThemeContext";
import DashboardLayout from "../../../../components/Layouts/DashboardLayout";

const Itaim = () => {
  const { theme } = useTheme();

  return (
    <DashboardLayout>
      <div
        className={`w-full h-full p-4 transition-colors duration-300 ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-100"
        }`}
      >
        <iframe
          title="DASH ISAP ITAIM"
          src="https://app.powerbi.com/view?r=eyJrIjoiNTA4YjE0ODMtNWVhOS00NzRlLWE0NjktMGI2MjQ2ZGU5ZGI4IiwidCI6ImMyMmE3MzJiLTk2NWItNDU4Ni1iZmNkLWY0MjgyNjYzMmFkNyJ9"
          className="w-full h-[85vh] rounded-xl border-0 shadow-lg"
          allowFullScreen
        />
      </div>
    </DashboardLayout>
  );
};

export default Itaim;
