<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import config from '../../config.json';
import { Input } from '../components/input';
import { useHistory } from '../components/history/hook';
import { History } from '../components/history/History';
import { banner } from '../utils/bin';

const ASCIIArt = () => {
  const [displayText, setDisplayText] = useState('');
  const [colorAngle, setColorAngle] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  
  const asciiArt = `                                     .:-==++***#######**++==-:.                                     
                               .:=+*##*++==--::::::::::---=++*##*+=-.                               
                           .-+*#*+=-:..........................:-=+*#*+-:                           
                        :=***=-......................................-=***+-.                       
                     :+**+-:.............................................-+*#+-                     
                  .=*#+-....................................................-+**=.                  
                .+**=:.........................................................=*#+:                
              .+#*=..............................................................-**+:              
             =**=..................................................................-**+.            
           :*#+......................................................................=**-           
          +#*-........................................................................:*#+.         
        .*#+........................:::-----::..........................................=#*:        
       :*#=..................=+**##############%##*+=-...................:-----===-......-**-       
      :*#=................=########################*%@@%#+-......:-=+*##%##########%......-*#-      
     .*#=...............-##*####*###%%%%%%%#*#######*%@@@@#%*+*###################%-.......-*#:     
     *#+...............*%*#########+===*#*####*#######@@@@%#####################%%:.........-#*.    
    +**...............###########*  :::  +#############@@@@*#################%@@%............+#*    
   :*#:..............*###*####### .++*=+: %###########*@@@@################@@@@#..............*#-   
   +#+............:=+@@@@@%#####% -=@@#=-.###########*#@@@@@@#*###########@@@@%...............=#*   
  .##:.......-+*#%##*###*###%*###*+**#+*.############@@@@@@@@@%**+==+*####%@@@.................**-  
  =#*.......##**###################################*@@@@@@@@@@@###*=:.-*###*#%:................+#+  
  *#=.......%##########################*############@@@@@@@@@@%#####*+:.-*####%-...............-##  
  ##=........:-++**#*#%%%@%%@@@@%:  .:-=+*#########*#@@@@@@@@%*########+:.=*###%+..............:##. 
  ##-...............-%@@@@%%%%%+           .-+*###%%###%%%%#############*=.:*###%*.............:##: 
  ##-.............+%@@@%%%%%%=                  -#@%######################+..=####*............:##: 
  ##-...........+@@@@%%%@%*-                      #@#######################+..-*##%+...........:##. 
  *#=..........#==+++=-:                           %%#######################+..-###%-..........-##  
  =#*..........:*=..  ..:-========:                =%###########*############*..+##*%..........+#+  
  :##:............------:.......*##*=.              %###########%*############*..*###+.........*#-  
   *#+........................:%#######-            -%#####*####@%#############*:=##*%........-#*   
   :#*:......................:%*######*##=           %*##*:*#####@%#############*-*###+.......*#=   
    +#+......................%#########*##%*:        +##*.:#######==%#*##########*+##*%......+#*    
    .*#=....................+%#######%#+=:..-+=      :%*:.-#######*  +%###############%=....-#*:    
     .*#-...................%###*##*=..........++:    %#:.-#######*   .*#*##############...:*#-     
      :#*-.................:%##%#=...............-+=  =%=.-#######+     -%#############@..:*#=      
       :**=................:%#+:...................:=+=@*..*######=      .%############@.-*#-       
        .*#+...........................................*#:.+#####%.       :%*##########@+**:        
          +#*:..........................................%*.-#####%         -%#########%%**.         
           -**=.........................................-%=.*####%          +#######%%#*=           
            .+#*-........................................=%==####@           %###*#%#*+.            
              :+#*-.......................................:*#*###%*=         -%*#%##*:              
                :+**=.......................................:*%##%.:*:       .@%#**-                
                  .=**+-......................................:++*...+=    :+%#*+:                  
                     -+#*+-...........................................=+=*###*-.                    
                       .-+**+=:......................................:=*#**-.                       
                           :=*#**=-:............................:-=+***=:.                          
                               :-=**#**+==--:::......::::--=+**#**+-:                               
                                    .:-==+***###########**+==-:.                                    
                                                ....                                                `;

  useEffect(() => {
    let currentIndex = 0;
    const textArray = asciiArt.split('');
    let typewriterInterval: NodeJS.Timeout;
    
    const typeNextChar = () => {
      if (currentIndex < textArray.length) {
        setDisplayText(prev => prev + textArray[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(typewriterInterval);
        setIsTypingComplete(true);
      }
    };

    typewriterInterval = setInterval(typeNextChar, 1);

    return () => {
      clearInterval(typewriterInterval);
    };
  }, [asciiArt]);

  useEffect(() => {
    const colorInterval = setInterval(() => {
      setColorAngle(prev => (prev + 1) % 360);
    }, 50);

    return () => clearInterval(colorInterval);
  }, []);

  const rgbStyle: React.CSSProperties = {
    color: `hsl(${colorAngle}, 100%, 50%)`,
    whiteSpace: 'pre' as const,
    fontFamily: 'monospace',
    fontSize: '8px',
    lineHeight: '8px'
  };

  return (
    <div className="h-full overflow-hidden flex items-center justify-center">
      <pre style={rgbStyle}>{isTypingComplete ? asciiArt : displayText}</pre>
    </div>
  );
};

const Clock = () => {
  const [time, setTime] = React.useState<string>('');
  const [date, setDate] = React.useState<string>('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      }));
      setDate(now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="text-6xl font-mono text-black">
        {time}
      </div>
      <div className="text-xl font-mono text-gray-600 mt-2">
        {date}
      </div>
    </div>
  );
};

const IndexPage = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);  // Add this line
  const containerRef = React.useRef(null);
  const {
    history,
    command,
    lastCommandIndex,
    setCommand,
    setHistory,
    clearHistory,
    setLastCommandIndex,
  } = useHistory([]);

  const init = React.useCallback(() => setHistory(banner()), []);

  React.useEffect(() => {
    init();
  }, [init]);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.scrollIntoView();
      inputRef.current.focus({ preventScroll: true });
    }
  }, [history]);

  return (
    <>
      <Head>
        <title>{config.title}</title>
      </Head>

      <div className="min-h-screen bg-gray-100 p-4 fixed inset-0">
      <div className="grid grid-cols-[2fr_1fr] gap-4 h-full">
        {/* Left terminal section - full height */}
        <div className="bg-white rounded-xl p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col">
          <div 
            ref={containerRef} 
            className="overflow-y-auto flex-1 max-h-[calc(100vh-2rem)]"
            style={{
              scrollBehavior: 'smooth'
            }}
          >
            <History history={history} />
            <Input
              inputRef={inputRef}
              containerRef={containerRef}
              command={command}
              history={history}
              lastCommandIndex={lastCommandIndex}
              setCommand={setCommand}
              setHistory={setHistory}
              setLastCommandIndex={setLastCommandIndex}
              clearHistory={clearHistory}
            />
          </div>
        </div>


          {/* Right section with clock and ASCII art */}
          <div className="grid grid-rows-[250px_1fr] gap-4">
            {/* Clock section */}
            <div className="h-full">
              <Clock />
            </div>

            {/* ASCII art section */}
            <div className="bg-white rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <ASCIIArt />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

=======
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Input } from '../components/input';
import { useHistory } from '../components/history/hook';
import { History } from '../components/history/History';
import { banner } from '../utils/bin';
import { Search } from "lucide-react";
import Marquee from "react-fast-marquee";

const TopBar = () => {
  const [datetime, setDatetime] = useState({
    time: '',
    day: '',
    date: '',
    month: '',
    year: ''
  });

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      setDatetime({
        time: now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }),
        day: now.toLocaleDateString('en-US', { weekday: 'long' }),
        date: now.getDate().toString().padStart(2, '0'),
        month: now.toLocaleDateString('en-US', { month: 'long' }),
        year: now.getFullYear().toString()
      });
    };

    // Update immediately
    updateDateTime();
    
    // Update every second
    const timer = setInterval(updateDateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex justify-between items-center px-6 py-2 border-[#76E4F7] border-x-2">
      <div className="flex gap-4 text-[#76E4F7] font-mono">
        <span>{datetime.time}</span>
        <span>|</span>
        <span>{datetime.day}</span>
        <span>|</span>
        <span>{datetime.date} {datetime.month}, {datetime.year}</span>
      </div>
      <div className="flex gap-6">
        {['X / TWITTER', 'TELEGRAM'].map((social) => (
          <a key={social} href="#" className="text-[#76E4F7] hover:text-white border border-[#76E4F7] px-2 py-1">
            {social}
          </a>
        ))}
      </div>
    </div>
  );
};

const Navigation = () => (
  <div className="border-[#76E4F7] border-x-2">
    <nav className="flex items-center px-6 py-3 text-[#76E4F7] font-mono">
      <div className="flex gap-6 items-center flex-1">
        {['HOME', 'TERMINAL', 'PROJECTS', 'SMARTCONTRACT', 'AIRDROP'].map((item) => (
          <a
            key={item}
            href="#"
            className="hover:text-white border border-[#76E4F7] px-3 py-1 transition-colors"
          >
            {item}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="bg-transparent border border-[#76E4F7] px-3 py-1 text-[#76E4F7] focus:outline-none"
          placeholder="Search..."
        />
        <button className="border border-[#76E4F7] p-1">
          <Search size={20} className="text-[#76E4F7]" />
        </button>
      </div>
    </nav>
  </div>
);

const NewsBar = () => (
  <div className="border-[#76E4F7] border-x-2 border-y-2">
    <div className="flex px-6 py-2">
      <div className="border-[#76E4F7] border-x-2 border-y-2 text-white px-3 py-1 font-mono">Flash News</div>
      <div className="flex-1 text-[#76E4F7] font-mono px-4 py-1 overflow-hidden whitespace-nowrap">
        <Marquee gradient={false}>
          Get ready for somenthing new - Powered by Solana | $SYDO 🐬 x $SOL
        </Marquee>
      </div>
    </div>
  </div>
);

const BannerPost = () => (
  <div className="border-[#76E4F7] border-2 p-6 mb-8">
    <h2 className="text-[#76E4F7] font-mono text-xl mb-4">Banner Posts</h2>
    <div className="grid grid-cols-1 gap-6">
      <div className="relative">
        <img src="/api/placeholder/1200/600" alt="Banner" className="w-full h-[400px] object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-4">
          <div className="text-[#76E4F7] font-mono">BUSINESS</div>
          <h3 className="text-[#76E4F7] text-2xl font-mono mt-2">
            Don't let fear get in the way of the life you are.
          </h3>
          <div className="flex gap-4 mt-2 text-[#76E4F7] font-mono">
            <span>Ademo</span>
            <span>May 7, 2022</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const GridPosts = () => (
  <div className="border-[#76E4F7] border-2 p-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-[#76E4F7] font-mono text-xl">Grid Posts</h2>
      <button className="text-[#76E4F7] border border-[#76E4F7] px-3 py-1 font-mono hover:text-white">
        View All
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="relative group">
          <img src="/api/placeholder/300/200" alt={`Grid ${i}`} className="w-full h-[200px] object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-3">
            <div className="flex justify-between text-[#76E4F7] font-mono text-sm">
              <span>{i} min read</span>
              <span>0</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Terminal = () => {
  const inputRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const {
    history,
    command,
    lastCommandIndex,
    setCommand,
    setHistory,
    clearHistory,
    setLastCommandIndex,
  } = useHistory([]);

  const init = React.useCallback(() => setHistory(banner()), []);

  React.useEffect(() => {
    init();
  }, [init]);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.scrollIntoView();
      inputRef.current.focus({ preventScroll: true });
    }
  }, [history]);

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] overflow-y-auto">
      <Head>
        <title>Terminal Blog</title>
      </Head>

      <div className="flex flex-col min-h-screen">
        <TopBar />
        <Navigation />
        <NewsBar />
        
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="border-[#76E4F7] border-2 p-6 mb-8">
            <div ref={containerRef} className="h-[400px] overflow-y-auto text-[#76E4F7] font-mono">
              <History history={history} />
              <Input
                inputRef={inputRef}
                containerRef={containerRef}
                command={command}
                history={history}
                lastCommandIndex={lastCommandIndex}
                setCommand={setCommand}
                setHistory={setHistory}
                setLastCommandIndex={setLastCommandIndex}
                clearHistory={clearHistory}
              />
            </div>
          </div>

          <BannerPost />
          <GridPosts />
        </main>
      </div>
    </div>
  );
};

<<<<<<< HEAD
>>>>>>> main
export default IndexPage;
=======
export default Terminal;
>>>>>>> 964188fd806b1126446a8e9f5a71269914e89ab8
