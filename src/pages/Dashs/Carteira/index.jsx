import { useTheme } from "../../../context/ThemeContext";
import DashboardLayout from "../../../components/Layouts/DashboardLayout";

const Carteira = () => {
  const { theme } = useTheme(); // pega o tema

  return (
    <DashboardLayout>
      <div
        className={`w-full h-full p-4 transition-colors duration-300 ${
          theme === "dark"
            ? "bg-gray-900"
            : "bg-gray-100"
        }`}
      >
        <iframe
          title="DASH 2"
          src="https://app.powerbi.com/view?r=eyJrIjoiNjAwNjNmOWUtMzdiYy00YzdmLTk2YmMtYThkYWVlZTY5MTcxIiwidCI6ImMyMmE3MzJiLTk2NWItNDU4Ni1iZmNkLWY0MjgyNjYzMmFkNyJ9"
          className="w-full h-[85vh] rounded-xl border-0 shadow-lg"
          allowFullScreen
        />
      </div>
    </DashboardLayout>
  );
};

export default Carteira;
