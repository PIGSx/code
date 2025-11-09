import { useState } from "react";
import { Download, Lock } from "lucide-react";

export default function DownloadPage() {
  const [files] = useState([
    {
      title: "Apoio - prazo",
      filename: "apoioprazo.xlsx",
      uploadedAgo: "2m ago",
      size: "28 kb",
      type: "xlsx",
      url: "/downloads/apoioprazo.xlsx",
      status: true,
    },
    {
  title: "Pagina Guia",
  filename: "guia.xlsx",
  uploadedAt: "1m ago",
  size: "2.09 mb",
  type: "xlsx",
  url: "/downloads/PAGINAGUIA.xlsx",
  status: true
},
    {
      title: "Documentação Technoblade",
      filename: "doc.pdf",
      uploadedAgo: "",
      size: "6.2 MB",
      type: "pdf",
      url: "",
      status: false,
    },
    {
      title: "Kits (base)",
      filename: "kits.xlsx",
      uploadedAgo: "",
      size: "12km",
      type: "xlsm",
      url: "/downloads/kits.xlsm",
      status: true,
    },
  ]);

  return (
    <div className="min-h-screen bg-[#0d0d0f] p-8 text-white">
      <h1 className="text-2xl font-semibold mb-6">Arquivos para Download</h1>

      {/* 🔎 (Barra de busca poderá ser ativada aqui futuramente) */}

      <div className="space-y-4">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 bg-[#1a1b1f] hover:bg-[#22232a] rounded-xl shadow transition"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-700 rounded-lg flex items-center justify-center text-sm uppercase">
                {file.type}
              </div>

              <div>
                <div className="font-semibold">{file.title}</div>
                <div className="text-xs text-gray-400">
                  {file.filename} · {file.uploadedAgo} · {file.size}
                </div>
              </div>
            </div>

            <div>
              {file.status ? (
                <a
                  href={file.url}
                  className="flex items-center gap-1 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md"
                  download
                >
                  <Download size={16} />
                  Baixar
                </a>
              ) : (
                <span className="flex items-center gap-1 text-sm bg-gray-600 text-gray-300 px-3 py-1.5 rounded-md">
                  <Lock size={16} />
                  Indisponível
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
