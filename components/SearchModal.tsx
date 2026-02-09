'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Command } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { searchCoins } from '@/lib/coingecko.actions';
// @ts-ignore
import { SearchCoin } from '@/type.d';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const SearchModal = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchCoin[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchCoins(searchQuery);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const onSelect = (coinId: string) => {
    setOpen(false);
    setQuery('');
    setResults([]);
    router.push(`/coins/${coinId}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div id="search-modal">
          <button className="trigger">
            <Search className="size-4" />
            <span>Search</span>
            <kbd className="kbd">
              <Command className="size-3" />K
            </kbd>
          </button>
        </div>
      </DialogTrigger>
      <DialogContent className="dialog p-0 overflow-hidden border-none shadow-2xl top-[20%] translate-y-0" showCloseButton={false}>
        <DialogHeader className="sr-only">
          <DialogTitle>Search Cryptocurrencies</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col w-full h-full max-h-[80vh]" id="search-modal">
          <div className="flex items-center px-4 py-4 bg-dark-500 border-b border-dark-400">
            <Search className="size-5 text-purple-100 mr-3" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search coins..."
              className="bg-transparent border-none focus-visible:ring-0 text-purple-100 placeholder:text-gray-500 text-lg h-auto p-0 flex-1"
              autoFocus
            />
            <div className="flex items-center gap-1 ml-2">
              <kbd className="kbd">ESC</kbd>
            </div>
          </div>
          <div className="list overflow-y-auto flex-1 bg-dark-500 scrollbar-hide">
            {loading ? (
              <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-100"></div>
                <span>Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="flex flex-col">
                <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-dark-500/50 sticky top-0 backdrop-blur-sm border-b border-dark-400/50">
                  Results
                </div>
                {results.map((coin) => (
                  <div
                    key={coin.id}
                    className="search-item px-4 hover:bg-dark-400/50 transition-colors"
                    onClick={() => onSelect(coin.id)}
                  >
                    <div className="coin-info">
                      <Image
                        src={coin.thumb}
                        alt={coin.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-white text-sm">{coin.name}</span>
                        <span className="coin-symbol text-xs">{coin.symbol}</span>
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-end items-center gap-3">
                       {coin.market_cap_rank && (
                           <span className="text-[10px] bg-dark-400 text-gray-400 px-1.5 py-0.5 rounded font-mono uppercase">
                             Rank #{coin.market_cap_rank}
                           </span>
                       )}
                       <kbd className="kbd text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">↵</kbd>
                    </div>
                  </div>
                ))}
              </div>
            ) : query ? (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
                <Search className="size-8 opacity-20" />
                <p>No results found for "<span className="text-white">{query}</span>"</p>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
                <Command className="size-8 opacity-20" />
                <div className="flex flex-col gap-1">
                  <p className="text-white font-medium">Search for coins</p>
                  <p className="text-sm">Find any cryptocurrency on the platform</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between px-4 py-2 bg-dark-400/30 border-t border-dark-400 text-[10px] text-gray-500 font-medium">
            <div className="flex items-center gap-4">
               <span className="flex items-center gap-1"><kbd className="kbd">↵</kbd> to select</span>
               <span className="flex items-center gap-1"><kbd className="kbd">↑↓</kbd> to navigate</span>
            </div>
            <div>
              {results.length > 0 && <span>{results.length} results found</span>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
