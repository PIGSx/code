import { useMemo, useState } from "react";
import {
  Download,
  Lock,
  FileSpreadsheet,
  FileText,
  Search,
  Archive,
  ShieldCheck,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function DownloadPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [search, setSearch] = useState("");

  const [files] = useState([
    {
      title: "Apoio - prazo",
      filename: "apoioprazo.xlsx",
      uploadedAgo: "2m ago",
      size: "28 KB",
      type: "xlsx",
      url: "/downloads/apoioprazo.xlsx",
      status: true,
    },
    {
      title: "Pagina Guia",
      filename: "guia.xlsx",
      uploadedAgo: "1m ago",
      size: "2.09 MB",
      type: "xlsx",
      url: "/downloads/PAGINAGUIA.xlsx",
      status: true,
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
      filename: "kits.xlsm",
      uploadedAgo: "",
      size: "12 KB",
      type: "xlsm",
      url: "/downloads/kits.xlsm",
      status: true,
    },
  ]);

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const value = `${file.title} ${file.filename} ${file.type}`.toLowerCase();
      return value.includes(search.toLowerCase());
    });
  }, [files, search]);

  const availableFiles = files.filter((file) => file.status).length;

  return (
    <main
      className={`
        relative min-h-screen overflow-hidden px-4 py-8 transition-colors duration-300 sm:px-6 lg:px-10
        ${
          isDark
            ? "bg-[#070b16] text-white"
            : "bg-slate-100 text-slate-950"
        }
      `}
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div
          className={`
            absolute inset-0 opacity-[0.04]
            ${
              isDark
                ? "bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)]"
                : "bg-[linear-gradient(to_right,black_1px,transparent_1px),linear-gradient(to_bottom,black_1px,transparent_1px)]"
            }
            bg-[size:56px_56px]
          `}
        />

        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <span
            className={`
              select-none whitespace-nowrap text-[20vw] font-black tracking-tight opacity-[0.035]
              ${isDark ? "text-white" : "text-slate-900"}
            `}
          >
            DOWNLOADS
          </span>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Hero */}
        <section
          className={`
            mb-8 rounded-[2rem] border p-6 shadow-xl backdrop-blur-2xl sm:p-8
            ${
              isDark
                ? "border-white/10 bg-white/[0.04]"
                : "border-white bg-white/80"
            }
          `}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div
                className={`
                  mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold
                  ${
                    isDark
                      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                      : "border-cyan-500/20 bg-cyan-500/10 text-cyan-700"
                  }
                `}
              >
                <ShieldCheck className="h-4 w-4" />
                Central de arquivos
              </div>

              <p
                className={`mt-3 max-w-2xl text-sm leading-6 sm:text-base ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Acesse planilhas, documentos, bases e arquivos de apoio
                disponibilizados pela plataforma.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
              <InfoBox label="Arquivos" value={files.length} />
              <InfoBox label="Disponíveis" value={availableFiles} />
            </div>
          </div>
        </section>

        {/* Barra de busca */}
        <section
          className={`
            mb-6 flex flex-col gap-4 rounded-3xl border p-4 backdrop-blur-2xl md:flex-row md:items-center md:justify-between
            ${
              isDark
                ? "border-white/10 bg-white/[0.04]"
                : "border-white bg-white/80"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400 text-white">
              <Archive className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-black">Arquivos disponíveis</h2>
              <p className={isDark ? "text-sm text-slate-400" : "text-sm text-slate-600"}>
                {filteredFiles.length} resultado(s) encontrado(s)
              </p>
            </div>
          </div>

          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

            <input
              type="text"
              placeholder="Buscar arquivo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`
                w-full rounded-2xl border px-12 py-3 text-sm outline-none transition
                ${
                  isDark
                    ? "border-white/10 bg-white/[0.06] text-white placeholder-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
                    : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/10"
                }
              `}
            />
          </div>
        </section>

        {/* Lista */}
        <section className="grid gap-4">
          {filteredFiles.map((file, index) => (
            <DownloadCard key={index} file={file} isDark={isDark} />
          ))}

          {filteredFiles.length === 0 && (
            <div
              className={`
                rounded-3xl border p-10 text-center backdrop-blur-2xl
                ${
                  isDark
                    ? "border-white/10 bg-white/[0.04] text-slate-400"
                    : "border-white bg-white/80 text-slate-600"
                }
              `}
            >
              Nenhum arquivo encontrado.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function DownloadCard({ file, isDark }) {
  const Icon = file.type === "pdf" ? FileText : FileSpreadsheet;

  return (
    <div
      className={`
        group flex flex-col gap-4 rounded-3xl border p-5 shadow-sm backdrop-blur-2xl transition-all duration-300
        sm:flex-row sm:items-center sm:justify-between
        ${
          isDark
            ? "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
            : "border-white bg-white/80 hover:bg-white"
        }
      `}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div
          className={`
            flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl
            ${
              file.status
                ? "bg-gradient-to-br from-violet-600 to-cyan-400 text-white"
                : "bg-slate-500/20 text-slate-400"
            }
          `}
        >
          <Icon className="h-6 w-6" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-black">{file.title}</h3>

            <span
              className={`
                rounded-full px-2.5 py-1 text-[11px] font-black uppercase
                ${
                  isDark
                    ? "bg-white/10 text-slate-300"
                    : "bg-slate-100 text-slate-600"
                }
              `}
            >
              {file.type}
            </span>
          </div>

          <p
            className={`mt-1 truncate text-sm ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {file.filename} · {file.uploadedAgo || "sem data"} · {file.size}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:justify-end">
        {file.status ? (
          <>
            <span className="hidden rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 sm:inline-flex">
              Disponível
            </span>

            <a
              href={file.url}
              download
              className="
                flex items-center justify-center gap-2 rounded-2xl
                bg-gradient-to-r from-violet-600 to-cyan-500
                px-4 py-2.5 text-sm font-black text-white
                shadow-lg shadow-cyan-500/20
                transition hover:scale-105
              "
            >
              <Download className="h-4 w-4" />
              Baixar
            </a>
          </>
        ) : (
          <span
            className="
              flex items-center justify-center gap-2 rounded-2xl
              bg-slate-500/15 px-4 py-2.5
              text-sm font-black text-slate-400
            "
          >
            <Lock className="h-4 w-4" />
            Indisponível
          </span>
        )}
      </div>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}