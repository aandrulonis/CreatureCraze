async function startup() {
    const { default: cpp_utils } = await import('../cpp_utils.js');
    const cppUtils = await cpp_utils();

    const island = new cppUtils.Island(10);
    island.evolve(10, 5);
    const song = island.getBestSong();
    console.log(`num notes: ${song.numNotes()}`)
//    song.writeToMidi("test.mid", ".");

    island.delete();
}

startup();