import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, AlertTriangle, CheckCircle, Image as ImageIcon, 
  Zap, Shield, BarChart3, ChevronRight, Activity, Info, 
  Droplets, Flame, Mountain, Building2, Phone
} from 'lucide-react';

const DISASTER_PROTOCOLS = {
  'Water_Disaster': {
    theme: 'cyan',
    icon: Droplets,
    title: 'Water Disaster Detected',
    immediateActions: [
      'Move to higher ground immediately.',
      'Do not walk, swim, or drive through floodwaters.',
      'Stay off bridges over fast-moving water.'
    ],
    protectionProtocols: [
      'Turn off utilities at the main switches or valves if instructed.',
      'Disconnect electrical appliances, but do not touch them if you are wet or standing in water.',
      'Prepare emergency go-bag with essential supplies.'
    ],
    emergencyContacts: 'Local Emergency: 911 | Flood Control: 1-800-427-7623',
    fact: 'Just 6 inches of moving water can knock you down, and 2 feet of water can sweep a vehicle away.'
  },
  'Fire_Disaster': {
    theme: 'rose',
    icon: Flame,
    title: 'Fire Disaster Detected',
    immediateActions: [
      'Evacuate the area immediately if ordered to do so.',
      'Cover your nose and mouth with a wet cloth to avoid inhaling smoke.',
      'Stay low to the ground if smoke is thick.'
    ],
    protectionProtocols: [
      'Close all doors and windows to prevent draft if evacuating a building.',
      'Do not use elevators during a fire.',
      'If your clothes catch fire: Stop, Drop, and Roll.'
    ],
    emergencyContacts: 'Fire Department: 911 | National Fire Response: 1-800-FIRE-LINE',
    fact: 'A house fire can become life-threatening in just two minutes.'
  },
  'Land_Disaster': {
    theme: 'amber',
    icon: Mountain,
    title: 'Land Disaster Detected',
    immediateActions: [
      'Evacuate immediately if you are in the path of a landslide or debris flow.',
      'Stay awake and alert; many debris-flow fatalities occur when people are sleeping.',
      'Listen for unusual sounds like trees cracking or boulders knocking together.'
    ],
    protectionProtocols: [
      'Move away from the path of the landslide or debris flow as quickly as possible.',
      'Avoid river valleys and low-lying areas.',
      'If escape is not possible, curl into a tight ball and protect your head.'
    ],
    emergencyContacts: 'Emergency Services: 911 | Geological Survey Info: 1-888-ASK-USGS',
    fact: 'Landslides can travel at speeds of up to 200 mph.'
  },
  'Damaged_Infrastructure': {
    theme: 'purple',
    icon: Building2,
    title: 'Infrastructure Damage Detected',
    immediateActions: [
      'Evacuate or stay clear of the damaged structure immediately.',
      'Watch out for falling debris and unstable overhangs.',
      'Do not enter any building that shows signs of structural damage.'
    ],
    protectionProtocols: [
      'Report the damage to local authorities or structural engineers.',
      'Shut off main gas and electrical lines if it is safe to do so.',
      'Document the damage from a safe distance if possible.'
    ],
    emergencyContacts: 'Emergency Services: 911 | City Maintenance: 311',
    fact: 'Micro-fractures in concrete can compromise the entire structural integrity before a collapse.'
  },
  'Non_Damage': {
    theme: 'emerald',
    icon: CheckCircle,
    title: 'No Damage Detected',
    immediateActions: [
      'No immediate emergency actions required.',
      'Continue monitoring the situation if you suspect an impending event.'
    ],
    protectionProtocols: [
      'Review your general emergency preparedness plan.',
      'Ensure your emergency kit is fully stocked.',
      'Stay informed via local news and weather channels.'
    ],
    emergencyContacts: 'Non-Emergency Line: 311',
    fact: 'Regularly updating your emergency preparedness plan increases survival rates by 50%.'
  }
};

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('predict');

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handlePredict = async (modelType) => {
    if (!selectedFile) return;

    setLoading(true);
    setResult(null);
    setActiveTab('predict');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('model_type', modelType);

    try {
      const response = await fetch('http://localhost:8099/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Prediction failed');

      const data = await response.json();
      setResult({ ...data, type: 'predict', modelUsed: modelType });
    } catch (error) {
      console.error(error);
      alert('Failed to get prediction from server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleEnhance = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setResult(null);
    setActiveTab('enhance');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:8099/enhance', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Enhancement failed');

      const data = await response.json();
      setResult({ ...data, type: 'enhance' });
    } catch (error) {
      console.error(error);
      alert('Failed to enhance image. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const getThemeClass = (disasterClass, type) => {
    const theme = DISASTER_PROTOCOLS[disasterClass]?.theme || 'primary';
    
    const themes = {
      cyan: {
        text: 'text-cyan-400',
        bg: 'bg-cyan-500',
        border: 'border-cyan-500/30',
        bgLight: 'bg-cyan-500/10',
        gradient: 'from-cyan-500 to-blue-500',
        glow: 'shadow-[0_0_15px_rgba(6,182,212,0.5)]'
      },
      rose: {
        text: 'text-rose-400',
        bg: 'bg-rose-500',
        border: 'border-rose-500/30',
        bgLight: 'bg-rose-500/10',
        gradient: 'from-rose-500 to-red-500',
        glow: 'shadow-[0_0_15px_rgba(244,63,94,0.5)]'
      },
      amber: {
        text: 'text-amber-400',
        bg: 'bg-amber-500',
        border: 'border-amber-500/30',
        bgLight: 'bg-amber-500/10',
        gradient: 'from-amber-500 to-orange-500',
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.5)]'
      },
      purple: {
        text: 'text-purple-400',
        bg: 'bg-purple-500',
        border: 'border-purple-500/30',
        bgLight: 'bg-purple-500/10',
        gradient: 'from-purple-500 to-indigo-500',
        glow: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]'
      },
      emerald: {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500',
        border: 'border-emerald-500/30',
        bgLight: 'bg-emerald-500/10',
        gradient: 'from-emerald-500 to-green-500',
        glow: 'shadow-[0_0_15px_rgba(16,185,129,0.5)]'
      },
      primary: {
        text: 'text-primary-400',
        bg: 'bg-primary-500',
        border: 'border-primary-500/30',
        bgLight: 'bg-primary-500/10',
        gradient: 'from-primary-500 to-blue-600',
        glow: 'shadow-[0_0_15px_rgba(59,130,246,0.5)]'
      }
    };

    return themes[theme][type] || '';
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white selection:bg-primary-500/30 overflow-x-hidden font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-dark-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-primary-500 to-accent-600 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 font-display">
                Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">Response</span>
              </h1>
              <p className="text-xs text-gray-400 tracking-wider uppercase font-medium">Disaster Damage Detection AI</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: Input Controls */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-3xl p-6 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-3 font-display">
              <ImageIcon className="w-5 h-5 text-primary-400" />
              Intelligence Feed
            </h2>
            
            <label 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-[1.5px] border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary-400/50 hover:bg-primary-500/5 transition-all duration-300 relative overflow-hidden"
            >
              <input type="file" className="hidden" accept="image/*" onChange={handleFileInput} />
              {preview ? (
                <motion.img 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={preview} 
                  alt="Preview" 
                  className="max-h-56 rounded-xl shadow-2xl ring-1 ring-white/10 object-cover w-full" 
                />
              ) : (
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-white/5 rounded-full mb-4 shadow-inner">
                    <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-primary-400 transition-colors" />
                  </div>
                  <p className="font-medium text-gray-300 text-center">Click or drag image to upload</p>
                  <p className="text-xs text-gray-500 mt-2 font-mono">JPG, PNG (MAX. 10MB)</p>
                </div>
              )}
            </label>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-3xl p-6"
          >
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-3 font-display">
              <Zap className="w-5 h-5 text-accent-400" />
              Analysis Engine
            </h2>
            
            <div className="space-y-4">
              <button 
                onClick={() => handlePredict('adaptive')}
                disabled={!selectedFile || loading}
                className="w-full relative overflow-hidden group py-4 px-5 rounded-2xl font-semibold disabled:opacity-50 transition-all bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 flex justify-between items-center shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                <span className="relative z-10">Adaptive Intelligent Predict</span>
                <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handlePredict('raw')}
                  disabled={!selectedFile || loading}
                  className="w-full bg-dark-800/80 hover:bg-dark-700 border border-white/5 hover:border-white/20 py-3 rounded-2xl font-medium text-sm transition-all disabled:opacity-50"
                >
                  Raw Model
                </button>
                <button 
                  onClick={() => handlePredict('standard')}
                  disabled={!selectedFile || loading}
                  className="w-full bg-dark-800/80 hover:bg-dark-700 border border-white/5 hover:border-white/20 py-3 rounded-2xl font-medium text-sm transition-all disabled:opacity-50"
                >
                  Standard Model
                </button>
              </div>

              <div className="pt-4 mt-2 border-t border-white/10">
                <button 
                  onClick={handleEnhance}
                  disabled={!selectedFile || loading}
                  className="w-full border border-accent-500/50 hover:bg-accent-500/10 text-accent-300 py-3.5 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Activity className="w-4 h-4" />
                  Pre-process Image (Enhance)
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8 min-h-[600px]">
          {loading ? (
            <div className="h-full glass rounded-3xl flex flex-col items-center justify-center p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="relative w-20 h-20 mb-8">
                  <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  <Activity className="absolute inset-0 m-auto w-6 h-6 text-primary-400 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold mb-2 font-display">Analyzing Sector</h3>
                <p className="text-gray-400 animate-pulse font-mono text-sm">Processing image through deep neural networks...</p>
              </div>
            </div>
          ) : result ? (
            <AnimatePresence mode="wait">
              {result.type === 'predict' && (
                <motion.div 
                  key="predict"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Top Result Banner */}
                  <div className={`p-8 rounded-3xl border ${getThemeClass(result.class, 'bgLight')} ${getThemeClass(result.class, 'border')} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                    
                    <div className="flex items-center gap-5 relative z-10">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${getThemeClass(result.class, 'gradient')} ${getThemeClass(result.class, 'glow')}`}>
                        {DISASTER_PROTOCOLS[result.class] ? 
                          (() => { const Icon = DISASTER_PROTOCOLS[result.class].icon; return <Icon className="w-8 h-8 text-white" /> })() : 
                          <AlertTriangle className="w-8 h-8 text-white" />
                        }
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 uppercase tracking-widest font-semibold mb-1">Status</p>
                        <h2 className="text-3xl font-bold font-display text-glow">
                          {DISASTER_PROTOCOLS[result.class]?.title || result.class.replace('_', ' ')}
                        </h2>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end relative z-10">
                      <div className="text-right">
                        <p className="text-sm text-gray-400 mb-1">Confidence Score</p>
                        <p className={`text-3xl font-bold font-mono ${getThemeClass(result.class, 'text')}`}>
                          {(result.confidence * 100).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column in Results */}
                    <div className="space-y-6">
                      {/* GradCAM */}
                      <div className="glass rounded-3xl p-6 relative group">
                        <h3 className="text-xl font-semibold mb-5 flex items-center gap-2 font-display">
                          <Activity className="w-5 h-5 text-accent-400" />
                          Spatial Attention (GradCAM)
                        </h3>
                        {result.gradcam_base64 && (
                          <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group-hover:ring-accent-500/50 transition-all">
                            <img src={`data:image/jpeg;base64,${result.gradcam_base64}`} alt="GradCAM" className="w-full object-cover" />
                            {/* Scanning effect */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-accent-400/50 shadow-[0_0_15px_rgba(167,139,250,0.8)] animate-scan hidden group-hover:block"></div>
                          </div>
                        )}
                        <p className="text-sm text-gray-400 mt-4 leading-relaxed">
                          Heatmap highlights the exact regions in the image that strongly influenced the neural network's classification decision.
                        </p>
                      </div>

                      {/* Probabilities */}
                      <div className="glass rounded-3xl p-6">
                        <h3 className="text-xl font-semibold mb-5 flex items-center gap-2 font-display">
                          <BarChart3 className="w-5 h-5 text-primary-400" />
                          Probability Distribution
                        </h3>
                        <div className="space-y-4">
                          {Object.entries(result.probabilities)
                            .sort(([, a], [, b]) => b - a)
                            .map(([cls, prob]) => (
                            <div key={cls} className="group/bar">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-300 font-medium group-hover/bar:text-white transition-colors">{cls.replace('_', ' ')}</span>
                                <span className="font-mono text-gray-400 group-hover/bar:text-white transition-colors">{(prob * 100).toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-dark-700 h-2.5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${prob * 100}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className={`h-full rounded-full bg-gradient-to-r ${getThemeClass(cls, 'gradient')}`}
                                ></motion.div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column in Results: Protection Protocols */}
                    <div className="glass rounded-3xl p-6 relative overflow-hidden flex flex-col h-full border border-white/5">
                      <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${getThemeClass(result.class, 'gradient')}`}></div>
                      
                      <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 font-display">
                        <Shield className={`w-6 h-6 ${getThemeClass(result.class, 'text')}`} />
                        Protection Protocols
                      </h3>

                      {DISASTER_PROTOCOLS[result.class] ? (
                        <div className="space-y-6 flex-grow flex flex-col">
                          
                          {/* Immediate Actions */}
                          <div className={`bg-dark-800/80 rounded-2xl p-5 border-l-4 ${getThemeClass(result.class, 'border')} border-l-${DISASTER_PROTOCOLS[result.class].theme}-500`}>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-2">
                              <AlertTriangle className={`w-4 h-4 ${getThemeClass(result.class, 'text')}`} />
                              Immediate Actions
                            </h4>
                            <ul className="space-y-3">
                              {DISASTER_PROTOCOLS[result.class].immediateActions.map((action, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                                  <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${getThemeClass(result.class, 'bg')}`}></div>
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Secondary Protocols */}
                          <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 ml-1">
                              General Safety Measures
                            </h4>
                            <ul className="space-y-3">
                              {DISASTER_PROTOCOLS[result.class].protectionProtocols.map((protocol, i) => (
                                <li key={i} className="flex items-start gap-3 bg-white/5 p-3.5 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-colors">
                                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 opacity-70" />
                                  <span>{protocol}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Emergency Contacts & Info */}
                          <div className="mt-auto space-y-4 pt-4">
                            <div className="flex items-center gap-3 bg-red-500/10 text-red-200 p-4 rounded-xl border border-red-500/20">
                              <Phone className="w-5 h-5 shrink-0 text-red-400" />
                              <span className="text-sm font-medium">{DISASTER_PROTOCOLS[result.class].emergencyContacts}</span>
                            </div>
                            
                            <div className="flex items-start gap-3 bg-blue-500/10 text-blue-200 p-4 rounded-xl border border-blue-500/20">
                              <Info className="w-5 h-5 shrink-0 text-blue-400 mt-0.5" />
                              <span className="text-xs leading-relaxed italic">
                                " {DISASTER_PROTOCOLS[result.class].fact} "
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm">No specific protocols available for this class.</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {result.type === 'enhance' && (
                <motion.div 
                  key="enhance"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="glass rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                    
                    <h2 className="text-3xl font-bold mb-8 font-display flex items-center gap-3">
                      <Activity className="w-8 h-8 text-accent-400" />
                      Enhancement Telemetry
                    </h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 relative z-10">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Raw Input</h3>
                        </div>
                        <div className="rounded-2xl overflow-hidden ring-1 ring-white/10 bg-dark-800">
                          <img src={preview} className="w-full object-cover" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-semibold text-accent-400 uppercase tracking-wider flex items-center gap-2">
                            <Zap className="w-4 h-4" /> Processed Output
                          </h3>
                        </div>
                        <div className="rounded-2xl overflow-hidden ring-2 ring-accent-500/50 shadow-[0_0_30px_rgba(139,92,246,0.3)] bg-dark-800">
                          <img src={`data:image/jpeg;base64,${result.enhanced_image_base64}`} className="w-full object-cover" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                      <div className="bg-dark-800/80 rounded-2xl p-6 border border-white/5">
                        <h3 className="text-lg font-semibold mb-4 border-b border-white/10 pb-3 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-gray-400" />
                          Image Metrics Analysis
                        </h3>
                        <div className="space-y-3 text-sm font-mono">
                          {[
                            { label: 'Brightness', val: result.report?.initial_metrics?.brightness },
                            { label: 'Contrast', val: result.report?.initial_metrics?.contrast },
                            { label: 'Blur Variance', val: result.report?.initial_metrics?.blur_laplacian },
                            { label: 'Noise Estimate', val: result.report?.initial_metrics?.noise_estimate }
                          ].map((metric, i) => (
                            <div key={i} className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors">
                              <span className="text-gray-400">{metric.label}:</span>
                              <span className="text-white font-semibold bg-dark-700 px-2 py-1 rounded">{metric.val?.toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between items-center p-3 mt-4 bg-accent-500/10 rounded-xl border border-accent-500/20">
                            <span className="text-accent-300 font-bold font-sans">Texture Preservation Score:</span>
                            <span className="text-accent-300 font-bold text-lg">{result.report?.initial_metrics?.texture_score?.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-dark-800/80 rounded-2xl p-6 border border-white/5">
                        <h3 className="text-lg font-semibold mb-4 border-b border-white/10 pb-3 flex items-center gap-2">
                          <Activity className="w-5 h-5 text-emerald-400" />
                          Applied Filters Pipeline
                        </h3>
                        <ul className="space-y-3">
                          {result.report?.applied_filters?.map((filter, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm bg-white/5 p-3 rounded-xl border border-white/5">
                              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                              <span className="font-mono text-gray-200">{filter}</span>
                            </li>
                          ))}
                        </ul>
                        {result.report?.degraded && (
                          <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl text-sm text-orange-200 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-orange-400" />
                            <p className="leading-relaxed">System detected that aggressive enhancement degraded essential texture details (critical for disaster classification). Adaptive algorithm successfully reverted to mild enhancement.</p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <div className="h-full glass rounded-3xl flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-white/10">
              <div className="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/5">
                <Shield className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold mb-3 font-display">System Ready</h3>
              <p className="text-gray-400 max-w-md text-sm leading-relaxed">
                Initialize the sequence by uploading imagery to the Intelligence Feed panel. The Neural Response system will evaluate the data for structural and environmental integrity.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
