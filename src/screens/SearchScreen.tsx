import { ActivityIndicator, Animated, DimensionValue, Dimensions, FlatList, Image, LayoutAnimation, NativeScrollEvent, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View, useColorScheme } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { TextInput } from 'react-native-paper';
// import Animated from 'react-native-reanimated';
import { DarkTheme, Theme } from '../defaults/ui';
// import { TextInput } from 'react-native';
import ModalArtwork from '../components/ModalArtwork';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Keyboard } from 'react-native';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type categories = 'artworks' | 'artists' | 'places' | undefined
type fetchStatus = 'success' | 'error' | 'unknown' | 'loading'

const SearchScreen = () => {
  
  const isDarkMode = useColorScheme() === 'dark';
  const currentTheme = isDarkMode ? DarkTheme : Theme;

  const [field, setField] = useState<categories>('artworks');
  
  const [loading, setLoading] = useState<boolean>(false)
  const [fetching, setFetching] = useState<fetchStatus>('unknown')
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
      
    console.log("searching for ", searchInput)
    fetch(url)
    .then(response => response.json())
    .then(json => {
      setMaxPages(json.pagination.total_pages)

      setFetching('success')
      console.log("This will add: ", json.data.length, " artworks")
      if (json.data.length <= 0) {
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
      setFetching('error')
      console.log('FETCHING ARTWORKS FAILED.', error)
    }) 
    .finally(() => {
      setLoading(false)
    })
  }

  const loadArtists = () => {
    const url = `https://api.artic.edu/api/v1/agents/search?q=${encodeURIComponent(searchInput)}&page=${currentPage}&fields=id,title,description`
        
    fetch(url)
    .then(response => response.json())
    .then(json => {

      setMaxPages(json.pagination.total_pages)

      setFetching('success')

      console.log("This will add: ", json.data.length, " artists")
      if (json.data.length <= 0) {
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
      setFetching('error')
      console.log('FETCHING ARTWORKS FAILED.', error)
    }) 
    .finally(() => {
      setLoading(false)
    })
  }

  const loadPlaces = () => {
    const url = `https://api.artic.edu/api/v1/places/search?q=${encodeURIComponent(searchInput)}&page=${currentPage}`
    //&fields=id,title,description`
        
    fetch(url)
    .then(response => response.json())
    .then(json => {

      setMaxPages(json.pagination.total_pages)

      setFetching('success')

      console.log("This will add: ", json.data.length, " artists")
      if (json.data.length <= 0) {
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
      setFetching('error')
      console.log('FETCHING ARTWORKS FAILED.', error)
    }) 
    .finally(() => {
      setLoading(false)
    })
  }

  const searchArtworks = () => {
    if (searchInput != '') {
      setFetching('loading')
      setLoading(true)
 
      switch (field) {
        case 'artworks': 
          loadArtworks()
          break
        case 'artists':
          loadArtists()
          break
        case 'places':
          loadPlaces()
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
    if (!loading && fetching != 'loading' && !changingInput && maxPages > currentPage) {
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
  }, [searchInput, field])

  
  
  const SearchHeader = () => {
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const inputAnim = useRef(new Animated.Value(100)).current;
    // const inputRange = [0, 100];
    // const outputRange = ["0%", "100%"]
    const [animatedWidth, setAnimatedWidth] = useState<DimensionValue | undefined>('100%');
    const [animatedSearch, setAnimatedSearch] = useState<Object>({
      width: '100%',
      backgroundColor: currentTheme.colors.primary
    });
    // const animatedWidth = inputAnim.interpolate({inputRange, outputRange});
    const [expanded, setExpanded] = useState<boolean>(true); 

    const fadeIn = () => {
      // Will change fadeAnim value to 1 in 5 seconds
      // Animated.timing(fadeAnim, {
      //   toValue: 1,
      //   duration: 250,
      //   useNativeDriver: true,
      // }).start();
      Animated.timing(inputAnim, {
          toValue: 100,
          duration: 250,
          useNativeDriver: true
      }).start();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded(true);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setAnimatedSearch({width: '100%', backgroundColor: currentTheme.colors.primary});
      console.log(expanded)
    };
  
    const fadeOut = () => {
      // Will change fadeAnim value to 0 in 3 seconds
      // Animated.timing(fadeAnim, {
      //   toValue: 0,
      //   duration: 250,
      //   useNativeDriver: true,
      // }).start();
      Animated.timing(inputAnim, {
        toValue: 80,
        duration: 250,
        useNativeDriver: true
    }).start();
      
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setAnimatedSearch({
        width: '80%',
        backgroundColor: currentTheme.colors.background,
        borderColor:  currentTheme.colors.foreground,
        borderWidth: currentTheme.spacing.xs / 4,
        height: 35
      })
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded(false);

      console.log(expanded)
    };

    const headerStyle = StyleSheet.create({
      textHeader: {
        fontFamily: currentTheme.fontFamily.butler_stencil,
        fontSize: currentTheme.fontSize.xxxl
      },
      searchContainer: {
        width: '100%',
        // height: 60,
        paddingVertical: currentTheme.spacing.s,
        backgroundColor: currentTheme.colors.background,
        // justifyContent: 'center',
        // alignItems: 'center',
        zIndex: 100
      },

      inputContainer: {
        // alignSelf: 'center',
        // paddingVertical: 12,
        backgroundColor: currentTheme.colors.primary,
        width: '100%',
        color: currentTheme.colors.foreground,
        fontSize: currentTheme.fontSize.m,
        height: 50,
        fontWeight: 'bold',
        borderRadius: currentTheme.spacing.s / 2,
        paddingHorizontal: currentTheme.spacing.m,
        // textAlign: 'left',
        // textAlignVertical: 'center',
      },

      cancelInput: {
        // backgroundColor: currentTheme.colors.primary,
        width: '100%',
        color: currentTheme.colors.foreground,
        fontSize: currentTheme.fontSize.m,
        flex: 1,
        fontWeight: '500',
        borderRadius: currentTheme.spacing.s / 2,
        paddingHorizontal: currentTheme.spacing.m,
      },

      searchCategory: {
        backgroundColor: currentTheme.colors.primary,
        paddingHorizontal: currentTheme.spacing.m,
        paddingVertical: currentTheme.spacing.s,
        borderRadius: currentTheme.spacing.s,
        marginTop: currentTheme.spacing.s,
        opacity: 0.5
      },
  
      highlightCategory: {
        borderWidth: 1,
        borderColor: currentTheme.colors.foreground,
        paddingHorizontal: currentTheme.spacing.m - 1,
        paddingVertical: currentTheme.spacing.s - 1,
        opacity: 1
        // backgroundColor: currentTheme.colors.background,
      },
  
      searchCategoryText: {
        fontWeight: '500',
        fontSize: currentTheme.fontSize.xs
      },

    })

    return (
      <>
        {expanded &&
          <Animated.Text 
            style={[headerStyle.textHeader, {opacity: fadeAnim}]}>Search</Animated.Text>
        }
        <View style={headerStyle.searchContainer}>
          <View style={{flexDirection: 'row'}}>
            <TextInput
              // autoFocus={true}
              left={<TextInput.Icon icon="card-search-outline" color={currentTheme.colors.foreground} />}
              onFocus={() => {
                fadeOut(); 
              }}
              onBlur={() => {
                fadeIn();
              }}
              style={[headerStyle.inputContainer, animatedSearch]}
              textAlign='left'
              textAlignVertical='center'
              placeholder={`Search for ${field}...`}
              inputMode='text'
              maxLength={100}
              selectTextOnFocus={true}
              placeholderTextColor={currentTheme.colors.foreground}
              defaultValue={String(searchInput)}
              onSubmitEditing={(text) => {handleText(text.nativeEvent.text), fadeIn(), Keyboard.dismiss()}}
            >
            </TextInput>
            {!expanded &&
              <TouchableOpacity 
                // style={[headerStyle.searchCategory, field == 'artworks' ? headerStyle.highlightCategory : {}]}
                onPress={() => {fadeIn(), Keyboard.dismiss()}}
              >
                <Animated.Text style={[headerStyle.cancelInput, {justifyContent: 'center', textAlignVertical: 'center', opacity: fadeAnim}]}>Cancel</Animated.Text>
              </TouchableOpacity>
            }
          </View>
          {!expanded &&
          <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly'}}>
            <TouchableOpacity 
              style={[headerStyle.searchCategory, field == 'artworks' ? headerStyle.highlightCategory : {}]}
              onPress={() => setField('artworks')}
            >
              <Text style={headerStyle.searchCategoryText}>Artworks</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[headerStyle.searchCategory, field == 'artists' ? headerStyle.highlightCategory : {}]}
              onPress={() => setField('artists')}
            >
              <Text style={headerStyle.searchCategoryText}>Agents</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[headerStyle.searchCategory, field == 'places' ? headerStyle.highlightCategory : {}]}
              onPress={() => setField('places')}
            >
              <Text style={headerStyle.searchCategoryText}>Places</Text>
            </TouchableOpacity>
          </View>
          }
        </View>
      </>
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
        paddingBottom: 10,
    },

    gradient: {
      bottom: currentTheme.spacing.xl + currentTheme.spacing.l, // + paddingTop
      marginBottom: -currentTheme.spacing.xl + currentTheme.spacing.l, // same as above
      paddingTop: currentTheme.spacing.l,
    },

    artistTouchable: {
      width: '100%', 
      aspectRatio: 0.91, 
      borderTopLeftRadius: currentTheme.spacing.s, 
      borderTopRightRadius: currentTheme.spacing.s
    },

    artistText: {
      position: 'relative',
      paddingHorizontal: currentTheme.spacing.s,
      paddingVertical: currentTheme.spacing.s,
      color: currentTheme.colors.foreground,
      fontSize: currentTheme.fontSize.m,
      // fontWeight: '500',
      fontFamily: currentTheme.fontFamily.butler,
      // borderColor: currentTheme.colors.background,
      // borderWidth: 2,
      // borderTopWidth: 2,
      // background: 'linear-gradient(90deg, rgba(9,9,121,1) 0%, rgba(0,212,255,1) 100%)'
      // backgroundColor: (currentTheme.colors.primary).concat('cc')
    }
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
        style={[styles.artworkTouchable, {marginBottom: -currentTheme.spacing.xxl, padding: currentTheme.spacing.xs}]} 
        onPress={() => {handleArtworkOpenPress(item)}}
        activeOpacity={0.9}
      >
        <Image 
          source={{uri: 'https://pyxis.nymag.com/v1/imgs/2cb/2e1/47a72da70b3f7a301273b06cac9ea615c8-06-bob-ross-painting.rsquare.w400.jpg'}} 
          style={styles.artistTouchable} 
        /> 
        <LinearGradient
          style={styles.gradient}
          // locations={[0, 0.9]}
          colors={[currentTheme.colors.background+'00', currentTheme.colors.background]}
        >
          <Text
            numberOfLines={1}
            style={styles.artistText}>{item?.title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>:<></>
    )
  }

  const Place = (item: any, index: number, row: number) => {
    return (
      (index % 2 == row && item) ?
      <TouchableOpacity 
        style={[styles.artworkTouchable, {padding: currentTheme.spacing.xs}]} 
        onPress={() => {handleArtworkOpenPress(item)}}
        activeOpacity={0.9}
      >
        <Image 
          source={{uri: 'https://pyxis.nymag.com/v1/imgs/2cb/2e1/47a72da70b3f7a301273b06cac9ea615c8-06-bob-ross-painting.rsquare.w400.jpg'}} 
          style={{width: '100%', aspectRatio: 0.85, borderRadius: currentTheme.spacing.s}} 
        /> 
        <Text 
          numberOfLines={1}
          style={styles.artistText}>{item?.title}</Text>
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
            keyExtractor={(item, index) => 1 + index.toString()}
            scrollEnabled={false}
            data={artworks}
            contentContainerStyle={styles.list}
            style={{height: '100%'}}
            renderItem={({ item, index }) => (
                field == 'artworks' ? Artwork(item, 0) :
                field == 'artists' ? Artist(item, index, 0) : 
                field == 'places' ? Place(item, index, 1) : <></> 
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
              field == 'artists' ? Artist(item, index, 1) : 
              field == 'places' ? Place(item, index, 1) : <></> 
            
            )}
          />
        </ScrollView>
        {(loading || fetching == 'loading') ? 
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
        {(searchInput == '') ? 
          <ScrollView>

          </ScrollView>
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