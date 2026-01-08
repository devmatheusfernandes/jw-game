"use client";

import { useState, useEffect } from "react";
import { getStages, deleteStage } from "@/lib/journey";
import { Stage } from "@/types/journey";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Edit, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


export default function JourneyAdminPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchStages = async () => {
    setLoading(true);
    const data = await getStages();
    setStages(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStages();
  }, []);

//   const handleSeedData = async () => {
//     if (!confirm("Isso irá sobrescrever/criar dados no Firebase com base no mock. Continuar?")) return;
//     try {
//         setLoading(true);
//         // Seed Stages
//         for (const stage of SEED_STAGES) {
//             await saveStage(stage, stage.id);
//         }
        
//         // Seed Decks
//         for (const deck of SEED_DECKS) {
//             await saveJourneyDeck(deck, deck.id);
//         }

//         toast.success("Dados de seed importados com sucesso!");
//         fetchStages();
//     } catch (error) {
//         console.error(error);
//         toast.error("Erro ao importar dados");
//     } finally {
//         setLoading(false);
//     }
//   };

  const handleDelete = async (id: string) => {
      try {
          await deleteStage(id);
          toast.success("Etapa removida");
          fetchStages();
      } catch (error) {
          toast.error("Erro ao remover etapa");
      }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gerenciar Jornada</h1>
        <div className="flex gap-2">
            <Button onClick={() => router.push("/admin/journey/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Etapa
            </Button>
        </div>
      </div>

      {loading ? (
        
    <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
           <div className="p-3 rounded-2xl bg-white/50 dark:bg-zinc-900/50 shadow-xl backdrop-blur-md">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
           </div>
        </div>
      </div>
      ) : (
        <div className="space-y-4">
          {stages.map((stage) => (
            <div 
                key={stage.id} 
                className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full ${stage.color} flex items-center justify-center text-white font-bold`}>
                        {stage.order}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{stage.title}</h3>
                        <p className="text-zinc-500 text-sm">{stage.description}</p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/journey/${stage.id}`)}>
                        <Edit className="w-4 h-4" />
                    </Button>
                    
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                <Trash className="w-4 h-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Essa ação não pode ser desfeita. Isso excluirá a etapa e seus decks associados.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(stage.id)} className="bg-red-500 hover:bg-red-600">
                                    Excluir
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
          ))}
          {stages.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                  Nenhuma etapa encontrada. Crie uma nova ou importe os dados de mock.
              </div>
          )}
        </div>
      )}
    </div>
  );
}
