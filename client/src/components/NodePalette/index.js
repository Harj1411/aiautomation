import { Mail, MessageSquare, Bot, Table, Zap, Sparkles } from 'lucide-react';

export default function NodePalette() {
  const paletteItems = [
    {
      type: 'input',
      label: 'Webhook Trigger',
      provider: 'webhook',
      icon: Zap,
      color: 'border-amber-500/30 text-amber-400 bg-amber-500/10'
    },
    {
      type: 'default',
      label: 'Gmail Dispatcher',
      provider: 'gmail',
      action: 'send_email',
      icon: Mail,
      color: 'border-rose-500/30 text-rose-400 bg-rose-500/10'
    },
    {
      type: 'default',
      label: 'Slack Notifier',
      provider: 'slack',
      action: 'post_message',
      icon: MessageSquare,
      color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
    },
    {
      type: 'default',
      label: 'Discord Bot',
      provider: 'discord',
      action: 'post_bot_message',
      icon: Bot,
      color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10'
    },
    {
      type: 'default',
      label: 'Google Sheets',
      provider: 'google-sheets',
      action: 'append_row',
      icon: Table,
      color: 'border-teal-500/30 text-teal-400 bg-teal-500/10'
    },
    {
      type: 'default',
      label: 'AI Automation',
      provider: 'openrouter',
      action: 'process_data',
      icon: Sparkles,
      color: 'border-purple-500/30 text-purple-400 bg-purple-500/10'
    }
  ];

  const onDragStart = (event, nodeData) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-dark-800 border-r border-slate-800 p-4 flex flex-col h-full">
      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
        Node Palette
      </h3>
      <p className="text-[11px] text-slate-500 mb-4">Drag nodes onto the canvas to compose workflows.</p>

      <div className="space-y-2.5 flex-1 overflow-y-auto">
        {paletteItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              draggable
              onDragStart={(e) => onDragStart(e, item)}
              className="p-3 rounded-lg bg-dark-900 border border-slate-800 hover:border-slate-700 cursor-grab active:cursor-grabbing flex items-center space-x-3 transition-all group shadow-sm hover:shadow-md"
            >
              <div className={`p-2 rounded-md border ${item.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-200 block group-hover:text-white">
                  {item.label}
                </span>
                <span className="text-[10px] text-slate-500 capitalize">{item.provider}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
