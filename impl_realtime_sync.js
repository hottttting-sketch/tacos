import fs from 'fs';

let content = fs.readFileSync('src/components/PuddingView.jsx', 'utf8');

// 1. Add real-time subscription logic to PuddingView
const realtimeSubscriptionLogic = `
  useEffect(() => {
    // projects テーブルと station_responses テーブルの変更を監視
    const projectsSubscription = supabase
      .channel('pudding-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        console.log('[Realtime] Projects table changed, refetching...');
        fetchProjects();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'station_responses' }, () => {
        console.log('[Realtime] Station responses changed, refetching...');
        fetchProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(projectsSubscription);
    };
  }, []);
`;

// Insert after the existing fetchProjects useEffect
if (!content.includes("channel('pudding-realtime')")) {
    content = content.replace(
        /useEffect\(\(\) => \{[\s\S]*?fetchProjects\(\);[\s\S]*?\}, \[\]\);/,
        `useEffect(() => {
    // コンポーネントマウント時に状態を明示的にリセット
    setActiveModal(null);
    setSelectedRequest(null);
    setSelectedBoardProject(null);
    fetchProjects();
  }, []);` + realtimeSubscriptionLogic
    );
    
    fs.writeFileSync('src/components/PuddingView.jsx', content, 'utf8');
    console.log('Successfully implemented real-time synchronization for projects!');
} else {
    console.log('Real-time subscription already exists!');
}
