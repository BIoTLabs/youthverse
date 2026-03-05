import { Card, CardContent } from '@/components/ui/card';
import { Users, TreePine, BookOpen, Briefcase, Award } from 'lucide-react';

interface AdminStatsProps {
  stats: { users: number; trees: number; skills: number; gigs: number; zltoIssued: number };
}

const AdminStats = ({ stats }: AdminStatsProps) => {
  const items = [
    { icon: Users, label: 'Youth Enrolled', value: stats.users, color: 'bg-accent/10 text-accent' },
    { icon: BookOpen, label: 'Skills Verified', value: stats.skills, color: 'bg-primary/10 text-primary' },
    { icon: Briefcase, label: 'Gigs Verified', value: stats.gigs, color: 'bg-accent/10 text-accent' },
    { icon: TreePine, label: 'Trees Verified', value: stats.trees, color: 'bg-primary/10 text-primary' },
    { icon: Award, label: 'Sigma Issued', value: stats.zltoIssued, color: 'gradient-gold text-secondary-foreground' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {items.map(s => (
        <Card key={s.label} className="border-border">
          <CardContent className="p-3 text-center">
            <div className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${s.color}`}>
              <s.icon className="h-4 w-4" />
            </div>
            <p className="font-display text-xl font-bold">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStats;
