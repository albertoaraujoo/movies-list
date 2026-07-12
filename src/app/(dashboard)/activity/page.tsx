import { auth } from "@/auth";
import { getActivityAction } from "@/actions/list-actions";
import { ActivityItem } from "@/components/activity-item";

export default async function ActivityPage() {
  const session = await auth();
  if (!session?.accessToken) return null;

  const activity = await getActivityAction("all").catch(() => ({
    mine: [],
    following: [],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display tracking-wider uppercase text-2xl sm:text-3xl text-foreground">
          Atividade
        </h1>
        <p className="font-sans text-sm text-muted-foreground mt-1">
          Acompanhe suas ações e as dos seus seguidores
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="font-display tracking-wider uppercase text-sm text-foreground border-b border-white/6 pb-2">
            Atividade dos seus Seguidores
          </h2>
          {activity.following.length === 0 ? (
            <p className="font-sans text-sm text-muted-foreground py-4">
              Nenhuma atividade recente dos seus seguidores.
            </p>
          ) : (
            <div className="space-y-3">
              {activity.following.map((item) => (
                <ActivityItem key={item.id} activity={item} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="font-display tracking-wider uppercase text-sm text-foreground border-b border-white/6 pb-2">
            Sua Atividade Recente
          </h2>
          {activity.mine.length === 0 ? (
            <p className="font-sans text-sm text-muted-foreground py-4">
              Você ainda não registrou atividades.
            </p>
          ) : (
            <div className="space-y-3">
              {activity.mine.map((item) => (
                <ActivityItem key={item.id} activity={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
