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
          <div className="bg-white rounded-xl p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div ref={containerRef} className="overflow-y-auto h-full">
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

export default IndexPage;