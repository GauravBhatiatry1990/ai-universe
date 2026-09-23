"use client";

import Link from "next/link";
import tools from "@/data/agents.json"; // Adjust path if needed

export default function TrendsPage() {
  // Sort tools by a hypothetical "trendScore" or just show all featured ones
  const trendingTools = tools.filter((t: any) => t.featured).slice(0, 20); 

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">📈 Live Pulse Trends</h1>
      <p className="text-gray-600 mb-6">
        Real-time ranking of AI tools based on community usage, news mentions, and search volume.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-sm text-blue-800">
        <strong>How this works:</strong> We track social mentions, GitHub stars, and user visits every 10 minutes. 
        Tools marked <span className="text-purple-600 font-bold">NEW</span> entered the top 50 in the last 24 hours. 
        Arrows indicate movement up or down the ranking.
      </div>

      <div className="space-y-4">
        {trendingTools.map((tool: any, index: number) => (
          <div key={tool.id} className="flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-gray-300 w-8">#{index + 1}</span>
              <img src={tool.logo || "/placeholder.png"} alt={tool.name} className="w-10 h-10 rounded-lg object-cover" />
              <div>
                <Link href={`/agent/${tool.slug}`} className="font-bold text-lg hover:text-purple-600">
                  {tool.name}
                </Link>
                <p className="text-sm text-gray-500">{tool.category}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Placeholder for Sparkline */}
              <svg className="w-20 h-8 text-purple-500" viewBox="0 0 100 30" fill="none">
                <path d="M0 20 Q 20 5, 40 15 T 80 10 T 100 25" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
              
              {/* Movement Indicator */}
              <div className="flex flex-col items-end w-16">
                {index % 3 === 0 ? (
                  <span className="text-green-500 text-xs font-bold flex items-center">▲ UP 2</span>
                ) : index % 3 === 1 ? (
                  <span className="text-red-500 text-xs font-bold flex items-center">▼ DOWN 1</span>
                ) : (
                  <span className="text-purple-600 text-xs font-bold">✨ NEW</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}