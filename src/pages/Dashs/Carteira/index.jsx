import DashboardLayout from "../../../components/Layouts/DashboardLayout";

const Carteira = () => {
  return (
    <DashboardLayout>
      <iframe
        title="DASH 2"
        src="https://app.powerbi.com/view?r=eyJrIjoiNjAwNjNmOWUtMzdiYy00YzdmLTk2YmMtYThkYWVlZTY5MTcxIiwidCI6ImMyMmE3MzJiLTk2NWItNDU4Ni1iZmNkLWY0MjgyNjYzMmFkNyJ9"
        className="w-full h-full border-0"
        allowFullScreen
      />
    </DashboardLayout>
  );
};

export default Carteira;
