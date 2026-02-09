import React from 'react';
import { fetcher } from '@/lib/coingecko.actions';
import DataTable from '@/components/DataTable';
import Image from 'next/image';
import Link from 'next/link';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';

const Page = async () => {
    let coins: CoinMarketData[] = [];

    try {
        coins = await fetcher<CoinMarketData[]>('/coins/markets', {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 20,
            page: 1,
            sparkline: false,
        });
    } catch (error) {
        console.error('Error fetching coins:', error);
    }

    const columns: DataTableColumn<CoinMarketData>[] = [
        {
            header: '#',
            cellClassName: 'rank-cell w-10',
            cell: (coin) => coin.market_cap_rank,
        },
        {
            header: 'Coin',
            cellClassName: 'name-cell',
            cell: (coin) => (
                <Link href={`/coins/${coin.id}`} className="flex items-center gap-3">
                    <Image src={coin.image} alt={coin.name} width={32} height={32} />
                    <div className="flex flex-col">
                        <p className="font-bold">{coin.name}</p>
                        <p className="text-xs text-gray-400 uppercase">{coin.symbol}</p>
                    </div>
                </Link>
            ),
        },
        {
            header: 'Price',
            cellClassName: 'price-cell font-medium',
            cell: (coin) => formatCurrency(coin.current_price),
        },
        {
            header: '24h Change',
            cellClassName: 'change-cell',
            cell: (coin) => {
                const isTrendingUp = coin.price_change_percentage_24h > 0;

                return (
                    <div className={cn('flex items-center gap-1', isTrendingUp ? 'text-green-500' : 'text-red-500')}>
                        {formatPercentage(coin.price_change_percentage_24h)}
                        {isTrendingUp ? (
                            <TrendingUp size={16} />
                        ) : (
                            <TrendingDown size={16} />
                        )}
                    </div>
                );
            },
        },
        {
            header: 'Market Cap',
            cellClassName: 'market-cap-cell hidden md:table-cell',
            cell: (coin) => formatCurrency(coin.market_cap),
        },
        {
            header: 'Volume',
            cellClassName: 'volume-cell hidden lg:table-cell',
            cell: (coin) => formatCurrency(coin.total_volume),
        },
    ];

    return (
        <main className="main-container py-10">
            <h1 className="text-3xl font-bold mb-8 text-purple-100">Cryptocurrency Prices by Market Cap</h1>
            
            <div className="bg-dark-300 rounded-2xl overflow-hidden border border-purple-100/10">
                <DataTable
                    columns={columns}
                    data={coins}
                    rowKey={(coin) => coin.id}
                    tableClassName="coins-table"
                />
            </div>
        </main>
    );
};

export default Page;