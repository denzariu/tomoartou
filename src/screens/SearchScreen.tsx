import { ActivityIndicator, Animated, Dimensions, FlatList, Image, NativeScrollEvent, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { DarkTheme, Theme } from '../defaults/ui';
import { TextInput } from 'react-native';
import ModalArtwork from '../components/ModalArtwork';


const SearchScreen = () => {
  
  const isDarkMode = useColorScheme() === 'dark';
  const currentTheme = isDarkMode ? DarkTheme : Theme;

  type categories = 'artworks' | 'artists' | undefined
  const [field, setField] = useState<categories>('artworks');
  
  const [loading, setLoading] = useState<boolean>(false)
  const [fetching, setFetching] = useState<boolean>(false)
  const [changingInput, setChangingInput] = useState<boolean>(true)
  const [searchInput, setSearchInput] = useState<string | number | boolean>('');

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [maxPages, setMaxPages] = useState<number>(99999999)
  // const [artworksData, setArtworksData] = useState<any | undefined>([])
  const [artworks, setArtworks] = useState<any | undefined>([])

  const [modalOpen, setModalOpen] = useState<any>()
  const [currentItem, setCurrentItem] = useState<any>()

  const [heightRow1, setHeightRow1] = useState<number>(0)
  const [heightRow2, setHeightRow2] = useState<number>(0)

  const iiif_url = 'https://www.artic.edu/iiif/2/';
  const size_url = '/full/400,/0/default.jpg';

  const LIMIT = 16;
  const OFFSET = 68;
  const BOTTOM_TAB_OFFSET: number = 0 //useBottomTabBarHeight()

  const loadArtworks = () => {
    const url = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(searchInput)}&page=${currentPage}&fields=id,title,image_id,thumbnail,artist_title,date_display,dimensions_detail,description,classification_title`
        
    fetch(url)
    .then(response => response.json())
    .then(json => {
      setMaxPages(json.pagination.total_pages)

      console.log("This will add: ", json.data.length, " artworks")
      if (json.data.length <= 0) {
        setFetching(false)
        setLoading(false)
        return
      }

      let S1: number = heightRow1
      let S2: number = heightRow2

      json.data = json.data.map( (item: any) => {
        if (item?.thumbnail) {
          if (S1 <= S2) {
            item.row = 0
            S1 += item.thumbnail?.height / item.thumbnail?.width
          }
          else {
            item.row = 1
            S2 += item.thumbnail?.height / item.thumbnail?.width
          }
        }
        item.title = item.title.replace('(', "\n(")
        if (item.description)
          item.description = item.description.replace(/<[^>]*>/g, '').replaceAll("&quot;", '"').replaceAll("\n", "\n\n")
        return item
      })

      console.log(json.data)
      console.log("After:", {row1: S1, row2: S2})

      if (S1 > 50 && S2 > 50)
        S1 -= 50, S2 -= 50

      setHeightRow1(S1)
      setHeightRow2(S2)
      setArtworks(artworks.concat(json.data))

    })
    .catch(error => {
      console.log('FETCHING ARTWORKS FAILED.', error)
    }) 
    .finally(() => {
      setFetching(false)
      setLoading(false)
    })
  }

  const loadArtists = () => {
    const url = `https://api.artic.edu/api/v1/agents/search?q=${encodeURIComponent(searchInput)}&page=${currentPage}&fields=id,title,description`
        
    fetch(url)
    .then(response => response.json())
    .then(json => {

      setMaxPages(json.pagination.total_pages)

      console.log("This will add: ", json.data.length, " artists")
      if (json.data.length <= 0) {
        setFetching(false)
        setLoading(false)
        return
      }

      json.data = json.data.map( (item: any) => {
        item.title = item.title.replace('(', "\n(")
        if (item.description)
          item.description = item.description.replace(/<[^>]*>/g, '').replaceAll("&quot;", '"').replaceAll("\n", "\n\n")
        return item
      })
      
      setArtworks(artworks.concat(json.data))

    })
    .catch(error => {
      console.log('FETCHING ARTWORKS FAILED.', error)
    }) 
    .finally(() => {
      setFetching(false)
      setLoading(false)
    })
  }

  const searchArtworks = () => {
    if (searchInput != '') {
      setFetching(true)
      setLoading(true)
 
      switch (field) {
        case 'artworks': 
          loadArtworks()
          break
        case 'artists':
          loadArtists()
          break
      }
    }
  }

  useEffect(() => {
    console.log({ maximum_pages: maxPages, current_page: currentPage, changing_input: changingInput })
    if (!changingInput)
      searchArtworks()
  }, [currentPage])
  
  const loadMoreArtworks = () => {    
    if (!loading && !fetching && !changingInput && maxPages > currentPage) {
      setLoading(true)
      const currentPageCopy = currentPage; //This is necessary in order to trigger an update
      setCurrentPage(currentPageCopy + 1);
    }
  }
  
  const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}: NativeScrollEvent) => {
    const paddingToBottom = 260; // Proximity to bottom, triggering event
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };
  
  const handleText = (text: string) => { 
    setSearchInput(text); 
  } 

  useEffect(() => {
    setChangingInput(() => {return true})
    setCurrentPage(() => {return 0})
    setArtworks([])
    setChangingInput(() => {return false})
    
    loadMoreArtworks()
  }, [searchInput])

  
  const SearchHeader = () => {
    return (
      <View style={styles.searchContainer}>
        <TextInput
          // autoFocus={true}
          style={styles.inputContainer}
          textAlign='center'
          textAlignVertical='center'
          placeholder='Search for artworks or artists...'
          inputMode='text'
          maxLength={100}
          selectTextOnFocus={true}
          placeholderTextColor={currentTheme.colors.foreground}
          defaultValue={searchInput}
          onSubmitEditing={(text) => handleText(text.nativeEvent.text)}
        >
        </TextInput>
      </View>
    )
  }

  const handleArtworkOpenPress = (item: any) => {
    setCurrentItem(item)
    setModalOpen(true)
  }

  const styles = StyleSheet.create({
    page: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: currentTheme.spacing.page
    },

    pageContainer: {
      flex: 1,
      width: '100%',
      paddingHorizontal: currentTheme.spacing.page
    },
    
    artworkTouchable: {
      
    },

    image: {
       
    },

    text: {
      color: currentTheme.colors.foreground
    },

    textNoMoreArtworks: {
      
      fontSize: currentTheme.fontSize.xl,
      fontFamily: currentTheme.fontFamily.butler_bold,
      textAlignVertical: 'center',
      textAlign: 'center'
    },

    rotate90: {
      transform: [{ rotate: '90deg' }]
    },

    loadingView: {

      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      justifyContent: 'center', 
      alignItems: 'center',
    },

    loadingIndicator: {
      padding: currentTheme.spacing.m,
      backgroundColor: currentTheme.colors.background,
      borderRadius: 32
    },

    wrapper: {
      flex: 1
    },
    container: {
        flexDirection: 'row',
    },
    list: {
        flex: 1,
        flexDirection: 'column',
        paddingVertical: 10,
    },

    searchContainer: {
      width: '100%',
      height: 60,
      paddingVertical: currentTheme.spacing.s,
      backgroundColor: currentTheme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100
    },

    inputContainer: {
      // alignSelf: 'center',
      // paddingVertical: 12,
      backgroundColor: currentTheme.colors.primary,
      width: '100%',
      color: currentTheme.colors.foreground,
      fontWeight: 'bold',
      borderRadius: currentTheme.spacing.s
    },
  })

  const Artwork = (item: any, row: number) => {
    return (
      (item.row == row && item && (item.image_id && item.thumbnail && item.thumbnail.height > 0)) ?
      <TouchableOpacity 
        style={styles.artworkTouchable} 
        onPress={() => {handleArtworkOpenPress(item)}}
        activeOpacity={0.9}
      >
        <Image 
          source={{uri: (iiif_url + item.image_id + size_url)}} style={[{width: '100%'}, item.thumbnail ? {aspectRatio: item.thumbnail.width / item.thumbnail.height} : {}]} 
        /> 
      </TouchableOpacity>:<></>
    )
  }

  const Artist = (item: any, index: number, row: number) => {
    return (
      (index % 2 == row && item) ?
      <TouchableOpacity 
        style={[styles.artworkTouchable, {padding: 2}]} 
        onPress={() => {handleArtworkOpenPress(item)}}
        activeOpacity={0.9}
      >
        <Image 
          source={{uri: 'https://pyxis.nymag.com/v1/imgs/2cb/2e1/47a72da70b3f7a301273b06cac9ea615c8-06-bob-ross-painting.rsquare.w400.jpg'}} 
          style={{width: '100%', aspectRatio: 1, borderRadius: 8}} 
        /> 
        <Text 
          numberOfLines={1}
          style={{position: 'relative', paddingLeft: currentTheme.spacing.s, bottom: 20, marginBottom: -20, color: currentTheme.colors.background, fontFamily: currentTheme.fontFamily.butler}}>{item?.title}</Text>
      </TouchableOpacity>:<></>
    )
  }

  return (
    // <SafeAreaView style={styles.page}>
      <SafeAreaView style={styles.pageContainer}>
        <SearchHeader/>
        
        <ScrollView 
          onScroll={({nativeEvent}) => {
            if (isCloseToBottom(nativeEvent)) {
              loadMoreArtworks();
            }
          }}
          // stickyHeaderIndices={[0]}
          // stickyHeaderHiddenOnScroll={false}
          removeClippedSubviews={true}
          contentContainerStyle={styles.container}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={400}
          style={{marginBottom: BOTTOM_TAB_OFFSET}}
        >
          <FlatList
            keyExtractor={(item, index) => 1  + index.toString()}
            scrollEnabled={false}
            data={artworks}
            contentContainerStyle={styles.list}
            style={{height: '100%'}}
            renderItem={({ item, index }) => (
                field == 'artworks' ? Artwork(item, 0) :
                field == 'artists' ? Artist(item, index, 0) : <></> 
              
            )}
          />
          <FlatList
            removeClippedSubviews={true}
            keyExtractor={(item, index) => 2 + index.toString()}
            scrollEnabled={false}
            data={artworks}
            contentContainerStyle={styles.list}
            style={{height: '100%'}}
            renderItem={({ item, index }) => (
              field == 'artworks' ? Artwork(item, 1) :
              field == 'artists' ? Artist(item, index, 1) : <></> 
            
            )}
          />
        </ScrollView>
        {(loading || fetching) ? 
          <View style={styles.loadingView}>
            <ActivityIndicator 
              animating={true}
              color={currentTheme.colors.loadingIndicator}
              style={styles.loadingIndicator}
              size={32}
            />
          </View>
          :
          <></>
        }
        {(maxPages <= currentPage && maxPages != 99999999) ? 
          <View style={{flex: 1}}>
            <Text style={styles.textNoMoreArtworks}>You've reached the end</Text>
            <Text style={[styles.textNoMoreArtworks, styles.rotate90]}>:)</Text>
          </View>
          :
          <></>
        }
        <ModalArtwork 
          currentItem={currentItem}
          open={modalOpen}
          OFFSET={BOTTOM_TAB_OFFSET}
          currentTheme={currentTheme}
          setOpen={setModalOpen}
        />
      </SafeAreaView>
    // </SafeAreaView>
  )
  
}

export default SearchScreen

const styles = StyleSheet.create({})