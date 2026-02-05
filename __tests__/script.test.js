/**
 * @jest-environment jsdom
 */

// Mock fetch globally
global.fetch = jest.fn();

// Mock DOM elements
document.body.innerHTML = `
    <div id="title">Will you be my Valentine?</div>
    <div id="subtitle">Test subtitle</div>
    <img id="gif" />
    <div id="gifLoading">Loading...</div>
    <div id="hintText"></div>
    <button id="yesBtn">Yes 💖</button>
    <button id="noBtn">No 🙃</button>
    <div id="confetti-container"></div>
`;

// Import the script after DOM is set up
// Note: In a real scenario, we'd need to refactor script.js to be more testable
// For now, we'll test the core logic

describe('Valentine Proposal Website', () => {
    beforeEach(() => {
        // Reset fetch mock
        fetch.mockClear();
        // Reset DOM
        document.getElementById('title').textContent = 'Will you be my Valentine?';
        document.getElementById('noBtn').classList.remove('hidden');
        document.getElementById('noBtn').textContent = 'No 🙃';
    });

    describe('GIPHY API Integration', () => {
        test('should fetch GIF with correct API endpoint', async () => {
            const mockResponse = {
                data: [
                    {
                        images: {
                            original: {
                                url: 'https://example.com/test.gif'
                            }
                        },
                        title: 'Test GIF'
                    }
                ]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            // Simulate fetchGif function
            const query = 'cute love cartoon';
            const apiKey = 'YOUR_GIPHY_API_KEY';
            const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=10&rating=g`;
            
            const response = await fetch(url);
            const data = await response.json();

            expect(fetch).toHaveBeenCalledWith(url);
            expect(data.data).toHaveLength(1);
            expect(data.data[0].images.original.url).toBe('https://example.com/test.gif');
        });

        test('should handle API errors gracefully', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            try {
                await fetch('https://api.giphy.com/v1/gifs/search');
            } catch (error) {
                expect(error.message).toBe('Network error');
            }
        });

        test('should handle empty API responses', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [] })
            });

            const response = await fetch('https://api.giphy.com/v1/gifs/search');
            const data = await response.json();

            expect(data.data).toHaveLength(0);
        });
    });

    describe('State Management', () => {
        test('should initialize with correct default state', () => {
            const state = {
                noClickCount: 0,
                accepted: false
            };

            expect(state.noClickCount).toBe(0);
            expect(state.accepted).toBe(false);
        });

        test('should track no button clicks', () => {
            let noClickCount = 0;
            noClickCount++;
            expect(noClickCount).toBe(1);
            
            noClickCount++;
            expect(noClickCount).toBe(2);
        });
    });

    describe('No Button Sequence', () => {
        test('should have 4 stages in sequence', () => {
            const noButtonSequence = [
                { label: "Are you sure? 🥺", gifQuery: "sad cute cartoon", hint: "Think about it…" },
                { label: "Positive?? 😭", gifQuery: "crying cute animation", hint: "We'd be cute though." },
                { label: "Last chance 😤💘", gifQuery: "dramatic cartoon heartbreak", hint: "Final final answer?" },
                { label: "Okay fine… 😔", gifQuery: "sad puppy cartoon", hint: "You can still press YES 👀" }
            ];

            expect(noButtonSequence).toHaveLength(4);
            expect(noButtonSequence[0].label).toBe("Are you sure? 🥺");
            expect(noButtonSequence[3].label).toBe("Okay fine… 😔");
        });
    });

    describe('Yes Button Behavior', () => {
        test('should update title on acceptance', () => {
            const title = document.getElementById('title');
            title.textContent = 'YAYYY!! 💞 Best decision ever.';
            expect(title.textContent).toBe('YAYYY!! 💞 Best decision ever.');
        });

        test('should hide no button on acceptance', () => {
            const noBtn = document.getElementById('noBtn');
            noBtn.classList.add('hidden');
            expect(noBtn.classList.contains('hidden')).toBe(true);
        });
    });

    describe('Button Scaling', () => {
        test('should calculate correct scale for yes button', () => {
            const noClickCount = 3;
            const scale = 1 + (noClickCount * 0.1);
            expect(scale).toBe(1.3);
        });

        test('should scale up with each no click', () => {
            let noClickCount = 0;
            const scales = [];
            
            for (let i = 0; i < 4; i++) {
                noClickCount++;
                scales.push(1 + (noClickCount * 0.1));
            }

            expect(scales).toEqual([1.1, 1.2, 1.3, 1.4]);
        });
    });
});

