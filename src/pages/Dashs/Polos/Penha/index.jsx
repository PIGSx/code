import DashboardLayout from "../../../../components/Layouts/DashboardLayout";

const Penha = () => {
  return (
       <DashboardLayout>
              <iframe
                title="DASH ISAP PENHA"
        src="https://app.powerbi.com/view?r=eyJrIjoiMmY2ZjZmYzMtMTVjNS00ZWY1LWE1YjctOWQ5Y2VjYWY2NTYxIiwidCI6ImMyMmE3MzJiLTk2NWItNDU4Ni1iZmNkLWY0MjgyNjYzMmFkNyJ9"
                className="w-full h-full border-0"
                allowFullScreen
              />
            </DashboardLayout>
  );
};

export default Penha;
