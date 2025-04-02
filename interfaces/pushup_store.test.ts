// This can go in __tests__/pushup_store.test.ts
// For now, we put this in interfaces/pushup_store.test.ts
import { act, renderHook } from '@testing-library/react-native';
import { usePushupStore } from '../interfaces/pushup_store';
import { supabase } from '../app/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';


jest.mock('uuid', () => ({
    v4: () => 'test-uuid',
}));

// Mock external dependencies
jest.mock('../app/supabase', () => ({
    supabase: {
        auth: {
            getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }),
        },
        from: jest.fn().mockReturnValue({
            insert: jest.fn().mockResolvedValue({ error: null }),
            update: jest.fn().mockResolvedValue({ error: null }),
            delete: jest.fn().mockResolvedValue({ error: null }),
            select: jest.fn().mockResolvedValue({ data: [], error: null }),
            upsert: jest.fn().mockResolvedValue({ error: null }),
            eq: jest.fn().mockReturnThis(),
            gt: jest.fn().mockReturnThis(),
        }),
    },
}));

// Clear storage and reset store between tests
beforeEach(async () => {
    await AsyncStorage.clear();
    const { result } = renderHook(() => usePushupStore());
    act(() => {
        result.current.entries = new Map();
        result.current.pendingOperations = [];
        result.current.lastSyncTime = new Date(0);
        result.current.isLoading = false;
        result.current.error = null;
    });
});

describe('PushupStore Basic Operations', () => {
    test('should add a new pushup entry', async () => {
        const { result } = renderHook(() => usePushupStore());

        await act(async () => {
            const id = await result.current.addEntry(10);
            expect(id).toBe('test-uuid');
            expect(result.current.entries.size).toBe(1);

            const entry = Array.from(result.current.entries.values())[0];
            expect(entry.count).toBe(10);
            expect(entry.user_id).toBe('test-user-id');
        });
    });

    test('should update an existing entry', async () => {
        const { result } = renderHook(() => usePushupStore());

        await act(async () => {
            const id = await result.current.addEntry(10);
            await result.current.updateEntry(id, 15);

            const entry = result.current.entries.get(id);
            expect(entry?.count).toBe(15);
        });
    });

    test('should delete an entry', async () => {
        const { result } = renderHook(() => usePushupStore());

        await act(async () => {
            const id = await result.current.addEntry(10);
            await result.current.deleteEntry(id);

            expect(result.current.entries.size).toBe(0);
        });
    });
});

describe('PushupStore Calculations', () => {
    // Store the real Date
    const RealDate = global.Date;
    let mockDate: Date;

    beforeEach(() => {
        // Clear storage
        AsyncStorage.clear();
        const { result } = renderHook(() => usePushupStore());
        act(() => {
            result.current.entries = new Map();
            result.current.pendingOperations = [];
            result.current.lastSyncTime = new Date(0);
            result.current.isLoading = false;
            result.current.error = null;
        });

        // Set up a fixed date for testing
        mockDate = new RealDate('2024-01-15T12:00:00Z');

        // Mock Date constructor and methods
        global.Date = class extends RealDate {
            constructor(date?: string | number | Date) {
                super();
                if (date) {
                    return new RealDate(date);
                }
                return mockDate;
            }

            static now() {
                return mockDate.getTime();
            }
        } as any;
    });

    afterEach(() => {
        // Restore the real Date
        global.Date = RealDate;
    });

    test('should calculate today\'s total correctly', async () => {
        const { result } = renderHook(() => usePushupStore());
        // Set a fixed date for testing
        const testDate = dayjs('2024-01-15');

        // Create entries for different times today
        const todayEntries = [
            {
                id: '1',
                user_id: 'test-user-id',
                count: 10,
                timestamp: testDate.hour(8).toISOString(), // 8 AM
                created_at: testDate.hour(8).toISOString(),
                updated_at: testDate.hour(8).toISOString(),
            },
            {
                id: '2',
                user_id: 'test-user-id',
                count: 15,
                timestamp: testDate.hour(14).toISOString(), // 2 PM
                created_at: testDate.hour(14).toISOString(),
                updated_at: testDate.hour(14).toISOString(),
            }
        ];

        // Create an entry for yesterday
        const yesterdayEntry = {
            id: '3',
            user_id: 'test-user-id',
            count: 20,
            timestamp: testDate.subtract(1, 'day').hour(14).toISOString(),
            created_at: testDate.subtract(1, 'day').hour(14).toISOString(),
            updated_at: testDate.subtract(1, 'day').hour(14).toISOString(),
        };

        // Create an entry for tomorrow
        const tomorrowEntry = {
            id: '4',
            user_id: 'test-user-id',
            count: 25,
            timestamp: testDate.add(1, 'day').hour(14).toISOString(),
            created_at: testDate.add(1, 'day').hour(14).toISOString(),
            updated_at: testDate.add(1, 'day').hour(14).toISOString(),
        };

        await act(async () => {
            // Import all entries
            await result.current.importEntries([
                ...todayEntries,
                yesterdayEntry,
                tomorrowEntry
            ]);

            // Check today's total (should only include today's entries)
            const todayTotal = result.current.getTotalForDate(testDate.toDate());
            expect(todayTotal).toBe(25); // 10 + 15 = 25
        });
    });

    test('should handle edge cases in today\'s total calculation', async () => {
        const { result } = renderHook(() => usePushupStore());

        const targetDate = dayjs("2024-01-15");

        // Entry at start of day
        const startOfDay = {
            id: '1',
            user_id: 'test-user-id',
            count: 5,
            timestamp: targetDate.startOf('day').toISOString(),
            created_at: targetDate.startOf('day').toISOString(),
            updated_at: targetDate.startOf('day').toISOString(),
        };

        // Entry at end of day
        const endOfDay = {
            id: '2',
            user_id: 'test-user-id',
            count: 5,
            timestamp: targetDate.endOf('day').toISOString(),
            created_at: targetDate.endOf('day').toISOString(),
            updated_at: targetDate.endOf('day').toISOString(),
        };

        await act(async () => {
            await result.current.importEntries([startOfDay, endOfDay]);

            const todayTotal = result.current.getTotalForDate(targetDate.toDate());
            expect(todayTotal).toBe(10); // 5 + 5 = 10
        });
    });

    test('should return 0 for days with no entries', async () => {
        const { result } = renderHook(() => usePushupStore());

        const todayTotal = result.current.getTotalForDate(new Date());
        expect(todayTotal).toBe(0);
    });
});

describe('PushupStore Sync Operations', () => {
    // This can occasionally throw Jest errors depending on your build setup!
    test('should handle server sync', async () => {
        const { result } = renderHook(() => usePushupStore());
    
        // Mock server response
        const mockServerEntries = [{
            id: 'server-1',
            user_id: 'test-user-id',
            count: 20,
            timestamp: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }];
    
        // Create a mock that properly handles the chain
        const mockSelect = jest.fn().mockReturnThis();
        const mockGt = jest.fn().mockResolvedValue({ 
            data: mockServerEntries, 
            error: null 
        });
    
        (supabase.from as jest.Mock).mockReturnValue({
            select: mockSelect,
            gt: mockGt
        });
    
        await act(async () => {
            await result.current.syncWithServer();
    
            // Verify the mocks were called correctly
            expect(mockSelect).toHaveBeenCalledWith('*');
            expect(mockGt).toHaveBeenCalled();
            
            // Verify the state was updated correctly
            expect(result.current.entries.size).toBe(1);
            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBeNull();
    
            // Verify the entry was stored correctly
            const entry = result.current.entries.get('server-1');
            expect(entry).toEqual(mockServerEntries[0]);
        });
    });

    test('should handle offline operations', async () => {
        const { result } = renderHook(() => usePushupStore());

        // Mock a failed server request
        (supabase.from as jest.Mock).mockReturnValueOnce({
            insert: jest.fn().mockResolvedValue({ error: new Error('Network error') }),
        });

        await act(async () => {
            await result.current.addEntry(10);

            // Check if entry was added to pending operations
            expect(result.current.pendingOperations.length).toBe(1);
            expect(result.current.entries.size).toBe(1);
        });
    });
});

describe('PushupStore Error Handling', () => {
    test('should handle and clear errors', async () => {
        const { result } = renderHook(() => usePushupStore());

        // Mock a failed server request
        (supabase.from as jest.Mock).mockReturnValueOnce({
            select: jest.fn().mockReturnThis(),
            gt: jest.fn().mockResolvedValue({
                data: null,
                error: {
                    message: 'Test error',
                    details: 'Error details',
                    hint: 'Error hint',
                    code: 'ERROR_CODE'
                }
            }),
        });

        await act(async () => {
            await result.current.syncWithServer();
        });

        expect(result.current.error).toBeTruthy();

        await act(async () => {
            result.current.clearError();
        });

        expect(result.current.error).toBeNull();
    });
});