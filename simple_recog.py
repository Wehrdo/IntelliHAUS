import sys, os
from pocketsphinx import *
import pyaudio

modeldir = "/usr/share/pocketsphinx/model"

# Create a decoder with certain model
config = Decoder.default_config()
config.set_string('-hmm', os.path.join(modeldir, 'hmm/en_US/hub4wsj_sc_8k'))
config.set_string('-dict', os.path.join(modeldir, 'en-us/cmudict-en-us.dict'))
config.set_string('-kws', 'keyphrase.list')

p = pyaudio.PyAudio()
stream = p.open(format=pyaudio.paInt16, channels=1, rate=16000, input=True, frames_per_buffer=1024)
stream.start_stream()

# Process audio chunk by chunk. On keyword detected perform action and restart search
decoder = Decoder(config)
decoder.start_utt()
while True:
    buf = stream.read(1024)
    decoder.process_raw(buf, False, False)
    if decoder.hyp() != None:
        print "Detected keyword: \n", decoder.hyp().hypstr, "\n\nrestarting search..."
        decoder.end_utt()
        decoder.start_utt()