import React, { useState, useEffect, useRef } from 'react';

const Game = () => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('highScore')) || 0);
    const [gameState, setGameState] = useState({ over: false, active: false, paused: false });
    const livesRef = useRef(3);
    const isInvulnerableRef = useRef(false);
    const invulnerabilityTimeoutRef = useRef(null);
    const [showInstructions, setShowInstructions] = useState(true);
    const playerRef = useRef(null);
    const projectilesRef = useRef([]);
    const gridsRef = useRef([]);
    const invaderProjectilesRef = useRef([]);
    const particlesRef = useRef([]);
    const keysRef = useRef({ a: { pressed: false }, d: { pressed: false }, space: { pressed: false } });
    const framesRef = useRef(0);
    const randomIntervalRef = useRef(Math.floor(Math.random() * 500 + 500));
    const animationIdRef = useRef(null);
    const lastBonusScoreRef = useRef(0);
    const lastFrameTimeRef = useRef(performance.now());
    const pauseStartTimeRef = useRef(0);
    const gameStartTimeRef = useRef(0);
    const particleColors = ['#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#FFFF00'];
    const [currentParticleColor, setCurrentParticleColor] = useState(particleColors[Math.floor(Math.random() * particleColors.length)]);
    const particleChangeInterval = 2000;

    const audioRef = useRef({
        backgroundMusic: new Audio('/audio/backgroundMusic.wav'),
        startSound: new Audio('/audio/start.mp3'),
        selectSound: new Audio('/audio/select.mp3'),
        shootSound: new Audio('/audio/shoot.wav'),
        enemyShootSound: new Audio('/audio/enemyShoot.wav'),
        explodeSound: new Audio('/audio/explode.wav'),
        bombSound: new Audio('/audio/bomb.wav'),
        bonusSound: new Audio('/audio/bonus.wav'),
        gameOverSound: new Audio('/audio/gameOver.mp3')
    });

    // Preload âm thanh với canplaythrough
    useEffect(() => {
        const audioFiles = [
            { audio: audioRef.current.backgroundMusic, name: 'backgroundMusic' },
            { audio: audioRef.current.startSound, name: 'startSound' },
            { audio: audioRef.current.selectSound, name: 'selectSound' },
            { audio: audioRef.current.shootSound, name: 'shootSound' },
            { audio: audioRef.current.enemyShootSound, name: 'enemyShootSound' },
            { audio: audioRef.current.explodeSound, name: 'explodeSound' },
            { audio: audioRef.current.bombSound, name: 'bombSound' },
            { audio: audioRef.current.bonusSound, name: 'bonusSound' },
            { audio: audioRef.current.gameOverSound, name: 'gameOverSound' }
        ];

        const preloadAudio = (audio, name) => {
            return new Promise((resolve, reject) => {
                audio.preload = 'auto';
                audio.load();
                audio.addEventListener('canplaythrough', () => {
                    console.log(`${name} preloaded successfully`);
                    resolve();
                }, { once: true });
                audio.addEventListener('error', () => {
                    console.error(`Error loading ${name}:`, audio.error);
                    reject(new Error(`Failed to load ${name}`));
                }, { once: true });
                // Timeout để tránh treo nếu âm thanh không tải được
                setTimeout(() => reject(new Error(`Timeout loading ${name}`)), 5000);
            });
        };

        const preloadAll = async () => {
            for (const { audio, name } of audioFiles) {
                try {
                    await preloadAudio(audio, name);
                } catch (err) {
                    console.error(`Failed to preload ${name}:`, err);
                }
            }
        };

        preloadAll();

        audioRef.current.backgroundMusic.loop = true;
        audioRef.current.backgroundMusic.volume = 0.3;
        audioRef.current.startSound.volume = 0.5;
        audioRef.current.selectSound.volume = 0.5;
        audioRef.current.shootSound.volume = 0.4;
        audioRef.current.enemyShootSound.volume = 0.4;
        audioRef.current.explodeSound.volume = 0.5;
        audioRef.current.bombSound.volume = 0.5;
        audioRef.current.bonusSound.volume = 0.5;
        audioRef.current.gameOverSound.volume = 0.5;

        return () => {
            Object.values(audioRef.current).forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
        };
    }, []);

    // Hệ thống cooldown âm thanh (không áp dụng cho shootSound)
    const soundCooldowns = useRef(new Map());
    const playSoundWithCooldown = (sound, cooldown = 100) => {
        const now = performance.now();
        if (!soundCooldowns.current.has(sound.src) || now - soundCooldowns.current.get(sound.src) > cooldown) {
            sound.currentTime = 0;
            sound.play().catch(err => console.error(`Error playing ${sound.src}:`, err));
            soundCooldowns.current.set(sound.src, now);
        }
    };

    useEffect(() => {
        if (!gameState.active || gameState.over || gameState.paused) return;
        const interval = setInterval(() => {
            setCurrentParticleColor(particleColors[Math.floor(Math.random() * particleColors.length)]);
        }, particleChangeInterval);
        return () => clearInterval(interval);
    }, [gameState]);

    useEffect(() => {
        particlesRef.current.forEach(particle => {
            if (!particle.fades) particle.color = currentParticleColor;
        });
    }, [currentParticleColor]);

    class Player {
        constructor() {
            this.velocity = { x: 0, y: 0 };
            this.rotation = 0;
            this.opacity = 1;
            this.position = { x: 0, y: 0 };
            const image = new Image();
            image.src = '/img/spaceship.png';
            image.onload = () => {
                console.log('Spaceship image loaded');
                const scale = 0.15;
                this.image = image;
                this.width = image.width * scale || 30;
                this.height = image.height * scale || 30;
                this.resetPosition();
            };
            image.onerror = () => {
                console.error('Failed to load spaceship image');
                this.width = 30;
                this.height = 30;
                this.resetPosition();
            };
        }

        resetPosition() {
            if (canvasRef.current) {
                this.position = {
                    x: canvasRef.current.width / 2 - (this.width || 0) / 2,
                    y: canvasRef.current.height - (this.height || 0) - 20
                };
            }
        }

        draw(c) {
            if (this.image && this.position) {
                c.save();
                c.globalAlpha = this.opacity;
                c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
                c.rotate(this.rotation);
                c.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2);
                c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
                c.restore();
            } else {
                c.fillStyle = 'blue';
                c.fillRect(this.position.x, this.position.y, this.width, this.height);
            }
        }

        update(c) {
            if (this.position) {
                this.draw(c);
                this.position.x += this.velocity.x;
                if (this.position.x < 0) this.position.x = 0;
                if (this.position.x + this.width > canvasRef.current?.width) {
                    this.position.x = canvasRef.current.width - this.width;
                }
            }
        }
    }

    class Projectile {
        constructor({ position, velocity }) {
            this.position = position;
            this.velocity = velocity;
            this.radius = 4;
        }

        draw(c) {
            c.beginPath();
            c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            c.fillStyle = 'red';
            c.fill();
            c.closePath();
        }

        update(c) {
            this.draw(c);
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        }
    }

    class Particle {
        constructor({ position, velocity, radius, color, fades }) {
            this.position = position;
            this.velocity = velocity;
            this.radius = radius;
            this.color = color;
            this.opacity = 1;
            this.fades = fades;
        }

        draw(c) {
            c.save();
            c.globalAlpha = this.opacity;
            c.beginPath();
            c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            c.fillStyle = this.color;
            c.fill();
            c.closePath();
            c.restore();
        }

        update(c) {
            this.draw(c);
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
            if (this.fades) this.opacity -= 0.01;
        }
    }

    class InvaderProjectile {
        constructor({ position, velocity }) {
            this.position = position;
            this.velocity = velocity;
            this.width = 3;
            this.height = 10;
        }

        draw(c) {
            c.fillStyle = 'white';
            c.fillRect(this.position.x, this.position.y, this.width, this.height);
        }

        update(c) {
            this.draw(c);
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
        }
    }

    class Invader {
        constructor({ position }) {
            this.velocity = { x: 0, y: 0 };
            this.position = { x: position.x, y: position.y };
            const image = new Image();
            image.src = '/img/invader.png';
            image.onload = () => {
                console.log('Invader image loaded');
                const scale = 1;
                this.image = image;
                this.width = image.width * scale || 30;
                this.height = image.height * scale || 30;
            };
            image.onerror = () => {
                console.error('Failed to load invader image');
                this.width = 30;
                this.height = 30;
            };
        }

        draw(c) {
            if (this.image && this.position) {
                c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
            } else {
                c.fillStyle = 'green';
                c.fillRect(this.position.x, this.position.y, this.width, this.height);
            }
        }

        update({ velocity }, c) {
            if (this.position) {
                this.draw(c);
                this.position.x += velocity.x;
                this.position.y += velocity.y;
            }
        }

        shoot(invaderProjectiles) {
            if (this.position && this.width && this.height) {
                invaderProjectiles.push(
                    new InvaderProjectile({
                        position: { x: this.position.x + this.width / 2, y: this.position.y + this.height },
                        velocity: { x: 0, y: 5 }
                    })
                );
                playSoundWithCooldown(audioRef.current.enemyShootSound);
            }
        }
    }

    class Grid {
        constructor() {
            this.position = { x: 0, y: 0 };
            this.velocity = { x: 3, y: 0.2 };
            this.invaders = [];
            const columns = Math.floor(Math.random() * 10 + 5);
            const rows = Math.floor(Math.random() * 5 + 2);
            this.width = columns * 30;

            for (let x = 0; x < columns; x++) {
                for (let y = 0; y < rows; y++) {
                    this.invaders.push(new Invader({ position: { x: x * 30, y: y * 30 } }));
                }
            }
        }

        update() {
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;

            if (this.position.x + this.width >= canvasRef.current?.width || this.position.x <= 0) {
                this.velocity.x = -this.velocity.x;
                this.position.y += 30;
            }
        }
    }

    const initGame = () => {
        if (!canvasRef.current) return;
        playerRef.current = new Player();
        gridsRef.current = [new Grid()];
        projectilesRef.current = [];
        invaderProjectilesRef.current = [];
        particlesRef.current = [];
        // Giảm số lượng hạt để cải thiện hiệu suất
        for (let i = 0; i < 20; i++) {
            particlesRef.current.push(
                new Particle({
                    position: { x: Math.random() * canvasRef.current.width, y: Math.random() * canvasRef.current.height / 2 },
                    velocity: { x: 0, y: 0.3 },
                    radius: Math.random() * 2,
                    color: currentParticleColor
                })
            );
        }
        keysRef.current = { a: { pressed: false }, d: { pressed: false }, space: { pressed: false } };
        framesRef.current = 0;
        randomIntervalRef.current = Math.floor(Math.random() * 500 + 500);
        setScore(0);
        lastBonusScoreRef.current = 0;
        livesRef.current = 3;
        isInvulnerableRef.current = false;
        lastFrameTimeRef.current = performance.now();
        gameStartTimeRef.current = performance.now();
        setGameState({ over: false, active: true, paused: false });
        // Phát backgroundMusic khi bắt đầu game
        audioRef.current.backgroundMusic.currentTime = 0;
        audioRef.current.backgroundMusic.play().catch(err => console.error('Error playing background music:', err));
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = 1024;
        canvas.height = 576;

        const handleKeyDown = (event) => {
            if (gameState.over || !gameState.active || gameState.paused) return;
            const { key } = event;
            switch (key) {
                case 'a':
                    keysRef.current.a.pressed = true;
                    break;
                case 'd':
                    keysRef.current.d.pressed = true;
                    break;
                case ' ':
                    event.preventDefault();
                    if (playerRef.current?.position) {
                        projectilesRef.current.push(
                            new Projectile({
                                position: { x: playerRef.current.position.x + playerRef.current.width / 2, y: playerRef.current.position.y },
                                velocity: { x: 0, y: -10 }
                            })
                        );
                        // Phát shootSound khi bắn (không dùng cooldown)
                        audioRef.current.shootSound.currentTime = 0;
                        audioRef.current.shootSound.play().catch(err => console.error('Error playing shoot sound:', err));
                    }
                    break;
            }
        };

        const handleKeyUp = ({ key }) => {
            switch (key) {
                case 'a':
                    keysRef.current.a.pressed = false;
                    break;
                case 'd':
                    keysRef.current.d.pressed = false;
                    break;
                case ' ':
                    keysRef.current.space.pressed = false;
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(animationIdRef.current);
        };
    }, [gameState]);

    useEffect(() => {
        if (gameState.active && !gameState.over && !gameState.paused && playerRef.current?.position) {
            if (canvasRef.current) {
                setShowInstructions(false);
                requestAnimationFrame(animate);
            }
        }
    }, [gameState]);

    const createParticles = ({ object, color, fades }) => {
        // Giảm số lượng hạt để cải thiện hiệu suất
        for (let i = 0; i < 5; i++) {
            particlesRef.current.push(
                new Particle({
                    position: { x: object.position.x + object.width / 2, y: object.position.y + object.height / 2 },
                    velocity: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },
                    radius: Math.random() * 3,
                    color: color || '#BAA0DE',
                    fades
                })
            );
        }
    };

    const drawLives = (c) => {
        c.clearRect(0, 0, 120, 50);
        if (livesRef.current > 0) {
            c.save();
            c.font = '24px sans-serif';
            c.fillStyle = 'red';
            c.textAlign = 'left';
            c.textBaseline = 'top';
            c.fillText('♥'.repeat(livesRef.current), 10, 10);
            c.restore();
        }
    };

    const drawPaused = (c) => {
        c.save();
        c.font = '48px sans-serif';
        c.fillStyle = 'white';
        c.textAlign = 'center';
        c.fillText('Tạm dừng', canvasRef.current?.width / 2, canvasRef.current?.height / 2);
        c.restore();
    };

    const handlePlayerCollision = () => {
        if (isInvulnerableRef.current || !playerRef.current?.position) return;

        isInvulnerableRef.current = true;
        // Phát bombSound khi người chơi bị trúng đạn hoặc va chạm
        playSoundWithCooldown(audioRef.current.bombSound);
        livesRef.current -= 1;
        console.log('Lives remaining after collision:', livesRef.current);

        const c = canvasRef.current?.getContext('2d');
        if (c) {
            drawLives(c);
        }

        if (livesRef.current <= 0) {
            console.log('Game Over triggered, setting gameState.over to true');
            if (playerRef.current) playerRef.current.opacity = 0;

            setGameState(prev => ({ ...prev, over: true, active: false, paused: false }));
            cancelAnimationFrame(animationIdRef.current);
            // Dừng backgroundMusic và phát gameOverSound
            audioRef.current.backgroundMusic.pause();
            audioRef.current.backgroundMusic.currentTime = 0;
            playSoundWithCooldown(audioRef.current.gameOverSound);

            if (score > highScore) {
                setHighScore(score);
                localStorage.setItem('highScore', score.toString());
            }
        } else {
            if (playerRef.current) {
                playerRef.current.opacity = 0.5;
                playerRef.current.resetPosition();
                createParticles({ object: playerRef.current, color: 'white', fades: true });
            }
        }

        if (invulnerabilityTimeoutRef.current) {
            clearTimeout(invulnerabilityTimeoutRef.current);
        }
        invulnerabilityTimeoutRef.current = setTimeout(() => {
            isInvulnerableRef.current = false;
            invulnerabilityTimeoutRef.current = null;
            if (playerRef.current) playerRef.current.opacity = 1;
        }, 1000);
    };

    const animate = () => {
        if (!gameState.active || gameState.over || !playerRef.current?.position) {
            console.log('Animation stopped due to game over, inactive state, or player not ready');
            return;
        }

        animationIdRef.current = requestAnimationFrame(animate);
        const currentTime = performance.now();
        const deltaTime = (currentTime - lastFrameTimeRef.current) / 1000;
        lastFrameTimeRef.current = currentTime;

        const elapsedTime = (currentTime - gameStartTimeRef.current) / 1000;
        const speedMultiplier = 1 + (elapsedTime / 60) * 0.1;

        const c = canvasRef.current?.getContext('2d');
        if (!c) return;

        c.fillStyle = 'black';
        c.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        drawLives(c);

        if (gameState.paused) {
            drawPaused(c);
            return;
        }

        if (playerRef.current) {
            playerRef.current.update(c);
        }

        particlesRef.current.forEach((particle, i) => {
            if (particle.position.y - particle.radius >= canvasRef.current.height) {
                particle.position.x = Math.random() * canvasRef.current.width;
                particle.position.y = -particle.radius;
            }
            if (particle.opacity <= 0) {
                particlesRef.current.splice(i, 1);
            } else {
                particle.update(c);
            }
        });

        invaderProjectilesRef.current.forEach((invaderProjectile, index) => {
            if (invaderProjectile.position.y + invaderProjectile.height >= canvasRef.current.height) {
                invaderProjectilesRef.current.splice(index, 1);
                return;
            } else {
                invaderProjectile.update(c);
            }

            if (playerRef.current?.position && playerRef.current?.width && playerRef.current?.height) {
                const playerLeft = playerRef.current.position.x;
                const playerRight = playerRef.current.position.x + playerRef.current.width;
                const playerTop = playerRef.current.position.y;
                const playerBottom = playerRef.current.position.y + playerRef.current.height;

                const projectileLeft = invaderProjectile.position.x;
                const projectileRight = invaderProjectile.position.x + invaderProjectile.width;
                const projectileTop = invaderProjectile.position.y;
                const projectileBottom = invaderProjectile.position.y + invaderProjectile.height;

                const isColliding =
                    !gameState.over &&
                    projectileBottom >= playerTop &&
                    projectileTop <= playerBottom &&
                    projectileRight >= playerLeft &&
                    projectileLeft <= playerRight;

                if (isColliding && !isInvulnerableRef.current) {
                    invaderProjectilesRef.current.splice(index, 1);
                    handlePlayerCollision();
                }
            }
        });

        projectilesRef.current.forEach((projectile, index) => {
            if (projectile.position.y + projectile.radius <= 0) {
                projectilesRef.current.splice(index, 1);
                return;
            } else {
                projectile.update(c);
            }
        });

        gridsRef.current.forEach((grid, gridIndex) => {
            grid.update();

            const gridBottom = grid.position.y + grid.invaders.reduce((max, invader) => {
                return invader.position ? Math.max(max, invader.position.y + (invader.height || 0)) : max;
            }, 0);
            if (gridBottom >= canvasRef.current.height) {
                console.log('Invaders reached the bottom - Reducing a life');
                handlePlayerCollision();
                return;
            }

            if (framesRef.current % 100 === 0 && grid.invaders.length > 0) {
                grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectilesRef.current);
            }

            grid.invaders.forEach((invader, i) => {
                if (invader.position) {
                    invader.update({ velocity: grid.velocity }, c);

                    if (playerRef.current?.position && playerRef.current?.width && playerRef.current?.height) {
                        const playerLeft = playerRef.current.position.x;
                        const playerRight = playerRef.current.position.x + playerRef.current.width;
                        const playerTop = playerRef.current.position.y;
                        const playerBottom = playerRef.current.position.y + playerRef.current.height;

                        const invaderLeft = invader.position.x;
                        const invaderRight = invader.position.x + (invader.width || 0);
                        const invaderTop = invader.position.y;
                        const invaderBottom = invader.position.y + (invader.height || 0);

                        const isColliding =
                            !gameState.over &&
                            playerBottom >= invaderTop &&
                            playerTop <= invaderBottom &&
                            playerRight >= invaderLeft &&
                            playerLeft <= invaderRight;

                        if (isColliding && !isInvulnerableRef.current) {
                            handlePlayerCollision();
                        }
                    }

                    projectilesRef.current.forEach((projectile, j) => {
                        if (invader.position && invader.width && invader.height && projectile.position) {
                            if (
                                projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
                                projectile.position.x + projectile.radius >= invader.position.x &&
                                projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
                                projectile.position.y + projectile.radius >= invader.position.y
                            ) {
                                const invaderFound = grid.invaders.find((invader2) => invader2 === invader);
                                const projectileFound = projectilesRef.current.find((projectile2) => projectile2 === projectile);
                                if (invaderFound && projectileFound) {
                                    setScore(prevScore => {
                                        const newScore = prevScore + 100;
                                        // Phát bonusSound khi đạt mốc 1000 điểm
                                        if (newScore >= lastBonusScoreRef.current + 1000) {
                                            playSoundWithCooldown(audioRef.current.bonusSound);
                                            lastBonusScoreRef.current = newScore;
                                        }
                                        return newScore;
                                    });
                                    // Phát explodeSound khi giết kẻ thù
                                    playSoundWithCooldown(audioRef.current.explodeSound);
                                    createParticles({ object: invader, fades: true });
                                    grid.invaders.splice(i, 1);
                                    projectilesRef.current.splice(j, 1);
                                    if (grid.invaders.length > 0) {
                                        const firstInvader = grid.invaders[0];
                                        const lastInvader = grid.invaders[grid.invaders.length - 1];
                                        grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width;
                                        grid.position.x = firstInvader.position.x;
                                    } else {
                                        gridsRef.current.splice(gridIndex, 1);
                                    }
                                }
                            }
                        }
                    });
                }
            });
        });

        if (!gameState.over && playerRef.current?.position) {
            if (keysRef.current.a.pressed && playerRef.current.position.x >= 0) {
                playerRef.current.velocity.x = -7;
                playerRef.current.rotation = -0.15;
            } else if (keysRef.current.d.pressed && playerRef.current.position.x + playerRef.current.width <= canvasRef.current.width) {
                playerRef.current.velocity.x = 7;
                playerRef.current.rotation = 0.15;
            } else {
                playerRef.current.velocity.x = 0;
                playerRef.current.rotation = 0;
            }
        }

        if (framesRef.current % Math.floor(randomIntervalRef.current / speedMultiplier) === 0 && !gameState.over) {
            gridsRef.current.push(new Grid());
            randomIntervalRef.current = Math.floor(Math.random() * 500 + 500);
            framesRef.current = 0;
        }

        framesRef.current++;
    };

    const handleStart = () => {
        if (!canvasRef.current) {
            const interval = setInterval(() => {
                if (canvasRef.current) {
                    clearInterval(interval);
                    // Phát startSound khi nhấn nút Start
                    playSoundWithCooldown(audioRef.current.startSound);
                    initGame();
                }
            }, 100);
            return;
        }
        // Phát startSound khi nhấn nút Start
        playSoundWithCooldown(audioRef.current.startSound);
        initGame();
        requestAnimationFrame(animate);
    };

    const handleRestart = () => {
        // Phát selectSound khi nhấn nút Restart
        playSoundWithCooldown(audioRef.current.selectSound);
        initGame();
        requestAnimationFrame(animate);
    };

    const handlePause = () => {
        // Phát selectSound khi nhấn nút Pause
        playSoundWithCooldown(audioRef.current.selectSound);
        setGameState(prev => ({ ...prev, paused: true }));
        // Dừng backgroundMusic khi tạm dừng
        audioRef.current.backgroundMusic.pause();
        pauseStartTimeRef.current = performance.now();
        cancelAnimationFrame(animationIdRef.current);
    };

    const handleResume = () => {
        // Phát selectSound khi nhấn nút Resume
        playSoundWithCooldown(audioRef.current.selectSound);
        setGameState(prev => ({ ...prev, paused: false }));
        // Tiếp tục backgroundMusic khi resume
        audioRef.current.backgroundMusic.play().catch(err => console.error('Error resuming background music:', err));
        lastFrameTimeRef.current = performance.now();
        gameStartTimeRef.current += performance.now() - pauseStartTimeRef.current;
        requestAnimationFrame(animate);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
            <div className="relative w-[1024px] h-[676px]">
                <canvas
                    ref={canvasRef}
                    className="bg-black border-2 border-cyan-500 rounded-lg shadow-[0_4px_77px_0_rgba(0,188,212,0.872)] p-2.5 z-10"
                    style={{ display: gameState.active ? 'block' : 'none' }}
                />
                {!gameState.active && showInstructions && (
                    <>
                        <button
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-black shadow-[0_4px_77px_0_rgba(0,188,212,0.872)] cursor-pointer px-5 py-2.5 text-xl border-none rounded-md"
                            onClick={handleStart}
                        >
                            Start Game
                        </button>
                        <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg text-center px-2.5 text-white">
                            Nhấn A/D để di chuyển, Space để bắn.
                        </div>
                    </>
                )}
                {gameState.active && (
                    <div className="flex relative bottom-full justify-between mx-10 text-white">
                        <span className="text-2xl my-2.5">Score: {score}</span>
                        <span className="text-2xl my-2.5">High Score: {highScore}</span>
                    </div>
                )}
                {gameState.over && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-20">
                        <div className="text-red-500 text-8xl font-bold italic" style={{ textShadow: '0 0 10px red' }}>
                            Game Over
                        </div>
                        <button
                            className="mt-6 bg-white text-black shadow-[0_4px_77px_0_rgba(0,188,212,0.872)] cursor-pointer px-6 py-3 text-2xl border-none rounded-md"
                            onClick={handleRestart}
                        >
                            Chơi lại
                        </button>
                    </div>
                )}
                {gameState.active && !gameState.paused && !gameState.over && (
                    <button
                        className="absolute right-0 top-0 bg-transparent text-white cursor-pointer px-5 py-2.5 text-xl border-none rounded-md mt-2.5"
                        onClick={handlePause}
                    >
                        <i className="fa-solid fa-pause"></i>
                    </button>
                )}
                {gameState.paused && (
                    <button
                        className="absolute right-0 top-0 bg-transparent text-white cursor-pointer px-5 py-2.5 text-xl border-none rounded-md mt-2.5"
                        onClick={handleResume}
                    >
                        <i className="fa-solid fa-play"></i>
                    </button>
                )}
            </div>
        </div>
    );
};

export default Game;