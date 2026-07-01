import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search, Filter, MoreVertical, Clock, Database, ChevronRight } from "lucide-react";
import Link from 'next/link';

// Custom DocumentCard component
const DocumentCard = ({ title, size, date, status, id }: { title: string; size: string; date: string; status: string; id: string | number }) => (
  <Link href={`/documents/${id}`}>
    <Card className="glass-card bg-white/5 border-white/10 group hover:border-indigo-500/50 transition-all duration-300 cursor-pointer overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="p-5 pb-0 flex flex-row items-start justify-between relative z-10">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shadow-inner">
          <FileText className="w-6 h-6 text-indigo-400" />
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-5 relative z-10 mt-2">
        <h3 className="font-semibold text-lg text-white mb-1 line-clamp-1 group-hover:text-indigo-300 transition-colors">{title}</h3>
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Database className="w-3.5 h-3.5" />
            <span>{size}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{date}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-6">
          <span className={`px-3 py-1 text-xs rounded-full border ${status === 'Processed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
            {status}
          </span>
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white text-zinc-400 transition-all">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  </Link>
);

export default function DocumentsPage() {
  const documents = [
    { id: 1, title: 'Company_Overview_2024.pdf', size: '3.2 MB', date: 'Oct 24, 2024', status: 'Processed' },
    { id: 2, title: 'Q3_Financials_Draft.docx', size: '1.1 MB', date: 'Oct 22, 2024', status: 'Processing' },
    { id: 3, title: 'Employee_Handbook_v2.pdf', size: '8.4 MB', date: 'Oct 15, 2024', status: 'Processed' },
    { id: 4, title: 'Marketing_Assets_List.pdf', size: '0.9 MB', date: 'Oct 12, 2024', status: 'Processed' },
    { id: 5, title: 'Product_Roadmap_Q4.pdf', size: '5.5 MB', date: 'Oct 10, 2024', status: 'Processed' },
    { id: 6, title: 'API_Documentation.pdf', size: '2.3 MB', date: 'Oct 05, 2024', status: 'Processing' },
  ];

  return (
    <div className="space-y-8 p-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Document Library</h1>
          <p className="text-zinc-400">Manage and browse your uploaded knowledge base documents.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
              placeholder="Search documents..." 
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
            />
          </div>
          <Button variant="outline" size="icon" className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white shrink-0">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {documents.map((doc) => (
          <DocumentCard key={doc.id} {...doc} />
        ))}
      </div>
    </div>
  );
}
